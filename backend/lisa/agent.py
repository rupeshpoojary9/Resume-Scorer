import asyncio
import contextlib
import datetime
import json
import logging
import os
import re
from typing import Optional

from dotenv import load_dotenv
from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode, create_react_agent
from mcp import ResourceUpdatedNotification, ServerNotification
from pydantic import AnyUrl, BaseModel

try:
    from backend.lisa.tools import GITLAB_TOOLS
except ImportError:
    from lisa.tools import GITLAB_TOOLS

# Load environment variables
load_dotenv("backend/.env")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
JOINLY_API_URL = os.getenv("JOINLY_API_URL", "http://localhost:8010/mcp/")
JOINLY_MODEL_NAME = os.getenv("JOINLY_MODEL_NAME", "gpt-4o")
JOINLY_MODEL_PROVIDER = os.getenv("JOINLY_MODEL_PROVIDER", "openai")

class TranscriptSegment(BaseModel):
    """A segment of a transcript."""
    text: str
    start: float
    end: float
    speaker: str | None = None

class Transcript(BaseModel):
    """A transcript containing multiple segments."""
    segments: list[TranscriptSegment]

def transcript_to_messages(transcript: Transcript) -> list[HumanMessage]:
    """Convert a transcript to a list of HumanMessage."""
    def _normalize_speaker(speaker: str | None) -> str:
        if speaker is None:
            return "Unknown"
        speaker = re.sub(r"\s+", "_", speaker.strip())
        return re.sub(r"[<>\|\\\/]+", "", speaker)

    return [
        HumanMessage(
            content=s.text,
            name=_normalize_speaker(s.speaker),
        )
        for s in transcript.segments
    ]

def transcript_after(transcript: Transcript, after: float) -> Transcript:
    """Get a new transcript including only segments starting after given time."""
    segments = [s for s in transcript.segments if s.start > after]
    return Transcript(segments=segments)

def log_chunk(chunk) -> None:
    """Log an update chunk from langgraph."""
    if "agent" in chunk:
        for m in chunk["agent"]["messages"]:
            for t in m.tool_calls or []:
                args_str = ", ".join(
                    f'{k}="{v}"' if isinstance(v, str) else f"{k}={v}"
                    for k, v in t.get("args", {}).items()
                )
                logger.info("%s: %s", t["name"], args_str)
    if "tools" in chunk:
        for m in chunk["tools"]["messages"]:
            logger.info("%s: %s", m.name, m.content)

async def run_agent(meeting_url: str):
    """Run the Lisa agent for a meeting."""
    mcp_url = JOINLY_API_URL
    
    transcript_url = AnyUrl("transcript://live")
    transcript_event = asyncio.Event()

    async def _message_handler(message) -> None:
        if (
            isinstance(message, ServerNotification)
            and isinstance(message.root, ResourceUpdatedNotification)
            and message.root.params.uri == transcript_url
        ):
            logger.info("Received transcript update notification")
            transcript_event.set()

    # Initialize LLM
    llm = init_chat_model(JOINLY_MODEL_NAME, model_provider=JOINLY_MODEL_PROVIDER)


    prompt = (
        f"Today is {datetime.datetime.now(tz=datetime.UTC).strftime('%d.%m.%Y')}. "
        "You are Lisa, a helpful AI assistant for the engineering team. "
        "You have access to the GitLab board and can manage tasks. "
        "Listen to the meeting and help when asked. "
        "If someone asks to create a card, check status, or add a comment, use your tools. "
        "You are only with one other participant in the meeting, therefore "
        "respond to all messages and questions. "
        "When you are greeted, respond politely in spoken language. "
        "Always finish your response with the 'finish' tool. "
        "Never directly use the 'finish' tool, always respond first and then use it. "
        "If interrupted mid-response, use 'finish'."
    )

    settings = {
        "name": "Lisa (AI Assistant)",
        "language": "en",
    }
    
    transport = StreamableHttpTransport(
        url=mcp_url, headers={"joinly-settings": json.dumps(settings)}
    )

    joinly_client = Client(transport, message_handler=_message_handler)

    logger.info("Connecting to Joinly MCP server at %s", mcp_url)
    
    async with joinly_client:
        if joinly_client.is_connected():
            logger.info("Connected to Joinly MCP server")
        else:
            logger.error("Failed to connect to Joinly MCP server at %s", mcp_url)
            return

        await joinly_client.session.subscribe_resource(transcript_url)

        @tool(return_direct=True)
        def finish() -> str:
            """Finish tool to end the turn."""
            return "Finished."

        # Load tools from Joinly and add GitLab tools
        tools = await load_mcp_tools(joinly_client.session)
        tools.extend(GITLAB_TOOLS) # Add our custom GitLab tools
        tools.append(finish)

        tool_node = ToolNode(tools, handle_tool_errors=lambda e: e)
        llm_binded = llm.bind_tools(tools, tool_choice="any")

        memory = MemorySaver()
        agent = create_react_agent(
            llm_binded, tool_node, prompt=prompt, checkpointer=memory
        )
        last_time = -1.0

        logger.info("Joining meeting at %s", meeting_url)
        try:
            # Add timeout because sometimes the client doesn't receive the return value
            await asyncio.wait_for(
                joinly_client.call_tool("join_meeting", {"meeting_url": meeting_url}),
                timeout=30
            )
            logger.info("Joined meeting successfully")
        except asyncio.TimeoutError:
            logger.warning("Join meeting timed out on client side (likely success on server). Proceeding...")
        except Exception as e:
            logger.error(f"Error joining meeting: {e}")
            # We might want to return here if it failed, but let's try to proceed if it was just a timeout
            # If it was a real error, the server logs would show it.


        while True:
            # Polling for transcript updates instead of waiting for event
            # This is more robust if notifications are dropped
            await asyncio.sleep(1)
            
            try:
                resource = await joinly_client.read_resource(transcript_url)
                # logger.info(f"Raw resource text length: {len(resource[0].text)}")
                transcript_full = Transcript.model_validate_json(resource[0].text)
            except Exception as e:

                logger.error(f"Error reading transcript: {e}")
                transcript_event.clear()
                continue

            transcript = transcript_after(transcript_full, after=last_time)
            transcript_event.clear()
            
            if not transcript.segments:
                continue

            last_time = transcript.segments[-1].start
            for segment in transcript.segments:
                logger.info(
                    '%s: "%s"',
                    segment.speaker if segment.speaker else "User",
                    segment.text,
                )

            try:
                async for chunk in agent.astream(
                    {"messages": transcript_to_messages(transcript)},
                    config={"configurable": {"thread_id": "1"}},
                    stream_mode="updates",
                ):
                    log_chunk(chunk)
            except Exception as e:
                logger.error(f"Error during agent invocation: {e}", exc_info=True)
                # Continue loop even if agent fails once
                continue

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Lisa AI Assistant")
    parser.add_argument("meeting_url", help="The URL of the meeting to join")
    args = parser.parse_args()

    try:
        asyncio.run(run_agent(args.meeting_url))
    except KeyboardInterrupt:
        logger.info("Lisa stopped by user.")

