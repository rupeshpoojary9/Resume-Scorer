from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.messages import HumanMessage
try:
    from ..services.ai_service import get_llm
    from backend.services.competitor_agent import competitor_graph
except ImportError:
    from services.ai_service import get_llm
    from services.competitor_agent import competitor_graph

router = APIRouter()

class ResearchRequest(BaseModel):
    competitor_name: str

class ResearchResponse(BaseModel):
    name: str
    website: str
    description: str
    tier: str
    neil_comparison: str
    strengths: list[str] = []
    weaknesses: list[str] = []
    market_focus: str = "General"
    pricing_model: str = "Unknown"
    market_presence: int = 50
    innovation_score: int = 50
    # Deep Dive Fields
    threat_level: str = "Unknown"
    risk_factors: list[str] = []
    feature_matrix: list[dict] = []
    market_radar: dict = {}
    kill_points: list[str] = []
    objections: list[dict] = []
    win_themes: list[str] = []

class MarketSegment(BaseModel):
    name: str
    description: str
    companies: list[str]

class CompetitorList(BaseModel):
    market_summary: str = "Market analysis pending."
    trends: list[str] = []
    segments: list[MarketSegment] = []
    competitors: list[ResearchResponse]

class NewsItem(BaseModel):
    id: str
    title: str
    source: str
    date: str
    summary: str
    url: str

class NewsList(BaseModel):
    news: list[NewsItem]


@router.post("/research", response_model=ResearchResponse)
async def research_competitor(request: ResearchRequest):
    try:
        print(f"Starting Agentic Research for: {request.competitor_name}")
        
        # Invoke the LangGraph workflow
        result = await competitor_graph.ainvoke({
            "competitor_name": request.competitor_name,
            "messages": [HumanMessage(content=f"Research {request.competitor_name}")]
        })
        
        profile = result.get("final_profile", {})
        
        # Map to response model
        return ResearchResponse(
            name=profile.get("name", request.competitor_name),
            website=profile.get("website", ""),
            description=profile.get("description", "Analysis failed."),
            tier=profile.get("tier", "N/A"),
            neil_comparison=profile.get("neil_comparison", "N/A"),
            strengths=profile.get("strengths", []),
            weaknesses=profile.get("weaknesses", []),
            market_focus=profile.get("market_focus", "N/A"),
            pricing_model=profile.get("pricing_model", "N/A"),
            market_presence=int(profile.get("market_presence", 50)),
            innovation_score=int(profile.get("innovation_score", 50)),
            threat_level=profile.get("threat_level", "Unknown"),
            risk_factors=profile.get("risk_factors", []),
            feature_matrix=profile.get("feature_matrix", []),
            market_radar=profile.get("market_radar", {}),
            kill_points=profile.get("kill_points", []),
            objections=profile.get("objections", []),
            win_themes=profile.get("win_themes", [])
        )
        
    except Exception as e:
        print(f"Error researching: {e}")
        # Fallback for research
        return ResearchResponse(
            name=request.competitor_name,
            website="",
            description="Could not fetch details (Agent Error).",
            tier="N/A",
            neil_comparison="N/A",
            strengths=[],
            weaknesses=[],
            market_focus="N/A",
            pricing_model="N/A",
            market_presence=50,
            innovation_score=50,
            threat_level="Unknown",
            risk_factors=[],
            feature_matrix=[],
            market_radar={},
            kill_points=[],
            objections=[],
            win_themes=[]
        )

@router.get("/discover", response_model=CompetitorList)
async def discover_competitors():
    try:
        try:
            from backend.services.competitor_agent import real_search_tool
        except ImportError:
            from services.competitor_agent import real_search_tool
        print("Discovering competitors via Real Search...")
        
        # 1. Run multiple search queries to broaden scope
        queries = [
            "top 10 procurement software competitors 2024",
            "top indian procurement software companies and startups",
            "emerging AI procurement software startups 2024"
        ]
        
        all_search_results = []
        for q in queries:
            try:
                res = real_search_tool(q)
                all_search_results.append(f"Query: {q}\nResult: {res}")
            except Exception as e:
                print(f"Search failed for {q}: {e}")
        
        combined_results = "\n\n".join(all_search_results)
        
        # 2. Use LLM to parse the search results into a list
        llm = get_llm()
        if not llm:
             raise Exception("No LLM available for parsing discovery results.")

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a market researcher. 
            Analyze the search results to provide a "Market Landscape" overview.
            
            Return a JSON object with:
            1. 'market_summary': 2-sentence overview of the space.
            2. 'trends': List of 3 key market trends (e.g. "GenAI Adoption").
            3. 'segments': List of objects {{ "name": "Segment Name", "description": "...", "companies": ["Company A", "Company B"] }}
               (Group companies into: "Legacy Giants", "AI Disruptors", "Niche Players", etc.)
            4. 'competitors': List of up to 15 unique objects.
               Each object must have: 
               - name
               - website (guess if needed)
               - description (1 sentence)
               - tier ('Tier 1', 'Tier 2', or 'Niche')
               - market_presence (integer 0-100, where 100 is dominant market leader)
               - innovation_score (integer 0-100, where 100 is highly disruptive/AI-native)
            
            Search Results:
            {results}
            """),
            ("human", "Extract market landscape and competitors.")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        parsed = await chain.ainvoke({"results": combined_results})
        
        competitors_data = parsed.get("competitors", [])
        market_summary = parsed.get("market_summary", "Analysis unavailable.")
        trends = parsed.get("trends", [])
        segments_data = parsed.get("segments", [])
        
        # Convert segments
        segments = [MarketSegment(**s) for s in segments_data]
        
        # 3. Convert to ResearchResponse objects
        results = []
        for comp in competitors_data:
            results.append(ResearchResponse(
                name=comp.get("name"),
                website=comp.get("website", ""),
                description=comp.get("description", ""),
                tier=comp.get("tier", "Tier 1"),
                neil_comparison="Pending detailed analysis...", # Placeholder until deep dive
                strengths=[],
                weaknesses=[],
                market_focus=comp.get("market_focus", "General"),
                pricing_model="Unknown",
                market_presence=int(comp.get("market_presence", 0)),
                innovation_score=int(comp.get("innovation_score", 0))
            ))
            
        return CompetitorList(
            market_summary=market_summary,
            trends=trends,
            segments=segments,
            competitors=results
        )

    except Exception as e:
        print(f"Discovery failed, falling back to static list: {e}")
        # Fallback to static list if search/parsing fails

        return CompetitorList(
            market_summary="Market scan failed. Showing static fallback data.",
            trends=["Data Unavailable"],
            segments=[],
            competitors=[
                ResearchResponse(
                    name="Coupa",
                    website="https://www.coupa.com",
                    description="Leading BSM platform.",
                    tier="Tier 1",
                    neil_comparison="Legacy giant.",
                    strengths=["Market Leader"],
                    weaknesses=["Expensive"],
                    market_focus="Enterprise",
                    pricing_model="Subscription",
                    market_presence=85,
                    innovation_score=60
                ),
                ResearchResponse(
                    name="SAP Ariba",
                    website="https://www.ariba.com",
                    description="SAP's procurement arm.",
                    tier="Tier 1",
                    neil_comparison="Complex ecosystem.",
                    strengths=["Integration"],
                    weaknesses=["UX"],
                    market_focus="Enterprise",
                    pricing_model="Custom",
                    market_presence=90,
                    innovation_score=40
                )
            ]
        )

@router.get("/news/{competitor_name}", response_model=NewsList)
async def get_competitor_news(competitor_name: str):
    # Mock news for demo purposes
    return NewsList(news=[
        NewsItem(
            id="1",
            title=f"{competitor_name} Announces Q4 Earnings",
            source="TechCrunch",
            date="2024-12-10",
            summary="Revenue grew by 15% YoY, driven by AI adoption.",
            url="#"
        ),
        NewsItem(
            id="2",
            title=f"New Strategic Partnership for {competitor_name}",
            source="Business Wire",
            date="2024-11-28",
            summary="Partnership aims to expand footprint in the Asian market.",
            url="#"
        ),
        NewsItem(
            id="3",
            title=f"Analyst Downgrades {competitor_name}",
            source="Bloomberg",
            date="2024-11-15",
            summary="Concerns over slowing growth in the enterprise sector.",
            url="#"
        )
    ])
