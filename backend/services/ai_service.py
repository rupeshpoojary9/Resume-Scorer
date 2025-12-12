import os
import json
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"
# Or more simply, since this file is in backend/services/
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key:
    client = OpenAI(api_key=api_key)
else:
    print("WARNING: OPENAI_API_KEY not found. AI features will fail.")

def get_client(api_key: str = None):
    if api_key:
        return OpenAI(api_key=api_key)
    
    # Fallback to env var
    env_key = os.getenv("OPENAI_API_KEY")
    if env_key:
        return OpenAI(api_key=env_key)
    return None

def parse_resume_with_ai(text: str, api_key: str = None) -> dict:
    """
    Parses resume text using OpenAI to extract structured data.
    """
    client = get_client(api_key)
    if not client:
        return {"error": "OpenAI API key not configured"}

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
    {text[:4000]}  # Truncate to avoid token limits if necessary, though 4o handles large context
    
    Return ONLY valid JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a precise data extraction assistant. Output only JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error parsing resume with AI: {e}")
        return {}

def parse_jd_with_ai(text: str, api_key: str = None) -> dict:
    """
    Parses JD text using OpenAI to extract requirements.
    """
    client = get_client(api_key)
    if not client:
        return {"error": "OpenAI API key not configured"}

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
    {text[:4000]}
    
    Return ONLY valid JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a precise data extraction assistant. Output only JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error parsing JD with AI: {e}")
        return {}

def score_candidate_with_ai(resume_json: dict, jd_json: dict, api_key: str = None) -> dict:
    """
    Scores a candidate against a JD using OpenAI.
    """
    client = get_client(api_key)
    if not client:
        return {"error": "OpenAI API key not configured"}

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
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a fair and precise recruiter. Output only JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error scoring candidate with AI: {e}")
        return {}
