import os
import json
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_llm(api_key: str = None):
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    # If provider is explicitly set to gemini, try it first
    if provider == "gemini":
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            return ChatGoogleGenerativeAI(model="gemini-3-flash-preview", google_api_key=gemini_key, temperature=0)
            
    # Default / OpenAI path
    openai_key = api_key or os.getenv("OPENAI_API_KEY")
    if openai_key and not openai_key.startswith("sk-placeholder"):
        try:
            return ChatOpenAI(model="gpt-4o-mini", api_key=openai_key, temperature=0)
        except:
            pass
            
    # Fallback to Gemini if OpenAI failed or wasn't selected but is available
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        return ChatGoogleGenerativeAI(model="gemini-3-flash-preview", google_api_key=gemini_key, temperature=0)
        
    return None

def parse_resume_with_ai(text: str, api_key: str = None) -> dict:
    """
    Parses resume text using AI to extract structured data.
    """
    llm = get_llm(api_key)
    if not llm:
        return {"error": "No valid AI API key configured (OpenAI or Gemini)"}

    prompt = f"""
    You are an expert ATS parser. Extract the following fields from the resume text below and return them as a valid JSON object.
    
    Fields to extract:
    - name (string)
    - email (string)
    - phone (string)
    - total_experience_years (number)
    - skills (object with keys: technical, domain, tools, soft_skills - each a list of strings)
    - job_titles (list of strings)
    - education (list of objects with degree, institution, year)
    - summary (string, rewrite to 3 lines max)
    
    Resume Text:
    {text[:10000]}
    
    Return ONLY valid JSON.
    """
    
    try:
        messages = [
            SystemMessage(content="You are a precise data extraction assistant. Output only JSON."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        content = response.content
        # Clean up markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing resume with AI: {e}")
        return {}

def parse_jd_with_ai(text: str, api_key: str = None) -> dict:
    """
    Parses JD text using AI to extract requirements.
    """
    llm = get_llm(api_key)
    if not llm:
        return {"error": "No valid AI API key configured"}

    prompt = f"""
    You are an expert Recruiter. Extract the following fields from the Job Description text below and return them as a valid JSON object.
    
    Fields to extract:
    - role_title (string)
    - department (string)
    - required_skills (list of strings)
    - good_to_have_skills (list of strings)
    - minimum_experience_years (number)
    - domain (string)
    - location (string)
    - mandatory_keywords (list of strings - deal breakers)
    
    JD Text:
    {text[:10000]}
    
    Return ONLY valid JSON.
    """
    
    try:
        messages = [
            SystemMessage(content="You are a precise data extraction assistant. Output only JSON."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing JD with AI: {e}")
        return {}

def score_candidate_with_ai(resume_json: dict, jd_json: dict, api_key: str = None) -> dict:
    """
    Scores a candidate against a JD using AI.
    """
    llm = get_llm(api_key)
    if not llm:
        return {"error": "No valid AI API key configured"}

    prompt = f"""
    You are an expert HR Recruiter. Evaluate the candidate based on the Job Description.
    
    Job Description:
    {json.dumps(jd_json, indent=2)}
    
    Candidate Profile:
    {json.dumps(resume_json, indent=2)}
    
    Task:
    1. Calculate a match score (0-100) based on:
       - Skills Match (45%)
       - Experience Match (25%)
       - Domain/Industry Match (20%)
       - Seniority/Role Fit (10%)
    2. Determine a Verdict: "Highly Relevant", "Relevant", "Borderline", "Not Relevant".
    3. List Missing Skills.
    4. List Matching Skills.
    5. Identify Red Flags (if any).
    6. Provide a brief 2-sentence reasoning.
    
    Return ONLY valid JSON with keys:
    - score (number)
    - verdict (string)
    - missing_skills (list)
    - matching_skills (list)
    - red_flags (list)
    - reasoning (string)
    """
    
    try:
        messages = [
            SystemMessage(content="You are a fair and precise recruiter. Output only JSON."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Error scoring candidate with AI: {e}")
        return {}
