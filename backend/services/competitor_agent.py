import os
import json
from typing import TypedDict, Annotated, List
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
try:
    from backend.services.ai_service import get_llm
except ImportError:
    from services.ai_service import get_llm

# --- State Definition ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    competitor_name: str
    plan: List[str]
    research_results: List[str]
    final_profile: dict

from langchain_community.tools import DuckDuckGoSearchRun

# --- Real Search Tool ---
search_tool = DuckDuckGoSearchRun()

def real_search_tool(query: str) -> str:
    """Performs a real web search using DuckDuckGo."""
    try:
        return search_tool.invoke(query)
    except Exception as e:
        return f"Search failed for '{query}': {e}"

# --- Nodes ---

def planner_node(state: AgentState):
    """Generates a research plan (list of queries)."""
    competitor = state["competitor_name"]
    print(f"--- Planner: Planning research for {competitor} ---")
    
    # In a real scenario, the LLM would generate this. For speed/reliability in demo:
    plan = [
        f"{competitor} key strengths and weaknesses reviews 2024",
        f"{competitor} pricing model cost",
        f"{competitor} target market customers",
        f"{competitor} vs AI procurement software comparison"
    ]
    
    return {"plan": plan, "messages": [SystemMessage(content=f"Planned research for {competitor}")]}

def executor_node(state: AgentState):
    """Executes the research plan using the search tool."""
    plan = state["plan"]
    results = []
    print(f"--- Executor: Running {len(plan)} real searches ---")
    
    for query in plan:
        result = real_search_tool(query)
        results.append(f"Query: {query}\nResult: {result}")
        
    return {"research_results": results, "messages": [SystemMessage(content=f"Executed {len(plan)} searches.")]}

async def analyst_node(state: AgentState):
    """Synthesizes research results into a structured profile."""
    competitor = state["competitor_name"]
    results = "\n\n".join(state["research_results"])
    print(f"--- Analyst: Synthesizing data for {competitor} ---")
    
    llm = get_llm()
    if not llm:
        # Fallback if no API key
        return {
            "final_profile": {
                "name": competitor,
                "description": "AI Service Unavailable",
                "tier": "N/A",
                "neil_comparison": "N/A",
                "strengths": [],
                "weaknesses": [],
                "market_focus": "N/A",
                "pricing_model": "N/A",
                "threat_level": "Low",
                "risk_factors": [],
                "feature_matrix": [],
                "market_radar": {
                    "pricing_pressure": 0,
                    "feature_completeness": 0,
                    "market_presence": 0,
                    "innovation_speed": 0,
                    "brand_strength": 0
                },
                "kill_points": [],
                "objections": [],
                "win_themes": []
            }
        }

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a Senior Competitive Analyst. 
        Analyze the provided research notes and construct a structured competitor profile for '{competitor}'.
        
        Return ONLY a JSON object with these fields:
        - name: Official Name
        - website: inferred website URL (e.g. https://www.coupa.com)
        - description: 2 sentence overview
        - tier: 'Tier 1' (Major), 'Tier 2' (Mid), or 'Niche'
        - neil_comparison: Compare vs 'Neil' (AI-first, fast, agile). Focus on where Neil wins.
        - strengths: List of 3 key strengths
        - weaknesses: List of 3 key weaknesses
        - market_focus: Target audience (e.g. Enterprise, SMB)
        - pricing_model: Summary of pricing (e.g. Subscription)
        - threat_level: 'Critical', 'High', 'Medium', or 'Low'
        - risk_factors: List of 3 specific risks this competitor poses to Neil
        - feature_matrix: List of objects {{ "feature": "Feature Name", "competitor_has": boolean, "neil_has": boolean, "note": "short comment" }}
          (Include features like: AI Automation, Custom Workflows, Mobile App, Free Tier, API Access)
        - market_radar: Object with 1-10 scores for:
          {{ "pricing_pressure": int, "feature_completeness": int, "market_presence": int, "innovation_speed": int, "brand_strength": int }}
        - kill_points: List of 3 high-impact statements to de-position the competitor.
        - objections: List of objects {{ "claim": "Competitor Claim", "rebuttal": "Neil's Rebuttal" }}
        - win_themes: List of 3 key pillars where Neil consistently wins.
        """),
        ("human", "Research Notes:\n{results}")
    ])
    
    chain = prompt | llm | JsonOutputParser()
    try:
        final_profile = await chain.ainvoke({"competitor": competitor, "results": results})
        return {"final_profile": final_profile}
    except Exception as e:
        print(f"Analyst Error: {e}")
        return {"final_profile": {}} # Should handle error better

# --- Graph Construction ---
def build_competitor_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("planner", planner_node)
    workflow.add_node("executor", executor_node)
    workflow.add_node("analyst", analyst_node)
    
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "executor")
    workflow.add_edge("executor", "analyst")
    workflow.add_edge("analyst", END)
    
    return workflow.compile()

# Singleton instance
competitor_graph = build_competitor_graph()
