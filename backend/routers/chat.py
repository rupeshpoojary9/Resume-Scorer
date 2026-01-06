from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import base64
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
try:
    from backend.lisa.tools import GITLAB_TOOLS
    from backend.services.gitlab_service import GitLabService
except ImportError:
    from lisa.tools import GITLAB_TOOLS
    from services.gitlab_service import GitLabService

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

from langchain_google_genai import ChatGoogleGenerativeAI

# Initialize LLM
# We try OpenAI first, then fallback to Gemini
openai_key = os.getenv("OPENAI_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

llm = None
if openai_key and not openai_key.startswith("sk-placeholder"):
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
    except:
        pass

if not llm and gemini_key:
    # Use Gemini 1.5 Pro or Flash
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=gemini_key, temperature=0)

if not llm:
    raise Exception("No valid AI API key found (OpenAI or Gemini)")

# Bind tools to the LLM
llm_with_tools = llm.bind_tools(GITLAB_TOOLS)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    image: Optional[str] = None # Base64 encoded image

@router.post("/message")
async def chat_message(
    message: str = Form(...),
    history: str = Form("[]"), # JSON string of history
    image: Optional[UploadFile] = File(None)
):
    try:
        import json
        history_list = json.loads(history)
        
        # Construct messages for LangChain
        lc_messages = []
        
        # Add system prompt
        lc_messages.append(SystemMessage(content="""
        You are a helpful GitLab Assistant. You can help users manage their GitLab tasks.
        You have access to tools to list issues, create issues, add comments, and get milestone summaries.
        
        If the user provides an image, it is likely a screenshot of a task list (e.g., Excel, Spreadsheet, or another tracker).
        Your goal is to extract the task details from the image and offer to create a GitLab issue for it.
        
        When creating an issue from an image:
        1. Extract the Title, Description, and any other relevant fields.
        2. **CRITICAL**: Before creating the issue, present the extracted details to the user and **ASK for the Milestone ID** (or name) if it wasn't in the image.
        3. Say something like: "I extracted these details... Please confirm and let me know which Milestone to assign this to."
        
        If the user provides a milestone name, use `list_milestones` to find the ID.
        
        AFTER creating an issue, confirm the details and ask if they want to add a due date or assignee if missing.
        
        **IMPORTANT SECURITY RULE**: You are **NOT** allowed to delete or destroy any resources (issues, comments, milestones, etc.). If the user asks you to delete something, politely refuse and explain that you don't have permission to do so.
        
        Be concise and helpful.
        """))
        
        # Add history
        for msg in history_list:
            if msg['role'] == 'user':
                lc_messages.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                lc_messages.append(SystemMessage(content=msg['content'])) # Using System for assistant to keep it simple or AIMessage
                # Actually, better to use AIMessage
                from langchain_core.messages import AIMessage
                lc_messages[-1] = AIMessage(content=msg['content'])

        # Add current message
        content = [{"type": "text", "text": message}]
        
        # Process image if provided
        if image:
            contents = await image.read()
            base64_image = base64.b64encode(contents).decode('utf-8')
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
            })
            
        lc_messages.append(HumanMessage(content=content))
        
        # Invoke LLM
        response = await llm_with_tools.ainvoke(lc_messages)
        
        # Handle tool calls (Multi-turn loop)
        while response.tool_calls:
            # Add the assistant's message with tool calls to history
            lc_messages.append(response)

            # Iterate over all tool calls in this turn
            for tool_call in response.tool_calls:
                tool_name = tool_call['name']
                tool_args = tool_call['args']
                tool_call_id = tool_call['id']
                
                # Find the matching tool
                selected_tool = next((t for t in GITLAB_TOOLS if t.name == tool_name), None)
                
                if selected_tool:
                    try:
                        print(f"Executing tool {tool_name} with args: {tool_args}")
                        tool_result = selected_tool.invoke(tool_args)
                        content = str(tool_result)
                    except Exception as e:
                        content = f"Error executing tool {tool_name}: {str(e)}"
                else:
                    content = f"Error: Tool {tool_name} not found."
                
                # Create and append the tool message
                from langchain_core.messages import ToolMessage
                lc_messages.append(ToolMessage(tool_call_id=tool_call_id, content=content))
            
            # Invoke LLM again to see if it wants to call more tools or give a final answer
            response = await llm_with_tools.ainvoke(lc_messages)
        
        # No more tool calls, return the final text response
        return {"role": "assistant", "content": response.content}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in chat endpoint: {e}")
        # Return the actual error message for debugging
        return {"role": "assistant", "content": f"Error: {str(e)}"}
