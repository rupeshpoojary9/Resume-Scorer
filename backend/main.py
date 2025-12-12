from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Resume, JobDescription

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Scorer API")

# CORS setup
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

@app.get("/")
def read_root():
    return {"message": "Resume Scorer API is running"}

from fastapi import UploadFile, File, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from .database import get_db
from .services.parser import extract_text
from .services.ai_service import parse_resume_with_ai, parse_jd_with_ai, score_candidate_with_ai

@app.post("/upload/resumes")
async def upload_resumes(
    files: List[UploadFile] = File(...), 
    jd_id: int = 1, # Default to 1 for backward compatibility
    db: Session = Depends(get_db),
    x_openai_key: Optional[str] = Header(None)
):
    print(f"Received upload_resumes request. Key present: {bool(x_openai_key)}")
    print(f"Files: {[f.filename for f in files]}")
    uploaded_ids = []
    for file in files:
        content = await file.read()
        text = extract_text(file.filename, content)
        
        # Parse with AI
        parsed_data = parse_resume_with_ai(text, api_key=x_openai_key)
        
        # Create DB entry
        db_resume = Resume(
            job_description_id=jd_id,
            filename=file.filename,
            raw_text=text,
            parsed_json=parsed_data,
            score_json={},  # Placeholder
            verdict="Pending"
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        uploaded_ids.append(db_resume.id)
    
    return {"message": f"Uploaded {len(files)} resumes", "ids": uploaded_ids}

@app.post("/upload/jd")
async def upload_jd(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    x_openai_key: Optional[str] = Header(None)
):
    print(f"Received upload_jd request. Key present: {bool(x_openai_key)}")
    print(f"File: {file.filename}")
    content = await file.read()
    text = extract_text(file.filename, content)
    
    # Parse with AI
    parsed_data = parse_jd_with_ai(text, api_key=x_openai_key)
    
    # Extract role title from parsed data, default to filename
    role_title = parsed_data.get("role_title", file.filename)
    
    # Create DB entry
    db_jd = JobDescription(
        role_title=role_title,
        filename=file.filename,
        raw_text=text,
        parsed_json=parsed_data
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    
    return {"message": "JD uploaded successfully", "id": db_jd.id, "role_title": role_title}

@app.post("/score")
def score_all_candidates(
    jd_id: int = None,
    db: Session = Depends(get_db),
    x_openai_key: Optional[str] = Header(None)
):
    # Get JD
    if jd_id:
        jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    else:
        # Fallback to latest
        jd = db.query(JobDescription).order_by(JobDescription.timestamp.desc()).first()
        
    if not jd:
        raise HTTPException(status_code=404, detail="No Job Description found")
    
    # Get resumes for this JD
    resumes = db.query(Resume).filter(Resume.job_description_id == jd.id).all()
    
    scored_count = 0
    for resume in resumes:
        if not resume.parsed_json:
            continue
            
        # Score
        score_data = score_candidate_with_ai(resume.parsed_json, jd.parsed_json, api_key=x_openai_key)
        
        # Update DB
        resume.score_json = score_data
        resume.verdict = score_data.get("verdict", "Unknown")
        scored_count += 1
    
    db.commit()
    return {"message": f"Scored {scored_count} candidates against JD: {jd.role_title}"}

@app.get("/analysis")
def get_analysis(jd_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Resume)
    if jd_id:
        query = query.filter(Resume.job_description_id == jd_id)
        
    resumes = query.all()
    # Sort by score descending
    sorted_resumes = sorted(resumes, key=lambda r: r.score_json.get("score", 0), reverse=True)
    return sorted_resumes

@app.get("/jds")
def get_jds(db: Session = Depends(get_db)):
    return db.query(JobDescription).order_by(JobDescription.timestamp.desc()).all()

@app.get("/resumes")
def get_resumes(db: Session = Depends(get_db)):
    return db.query(Resume).all()

@app.get("/resumes/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@app.get("/jd")
def get_jd(db: Session = Depends(get_db)):
    jd = db.query(JobDescription).order_by(JobDescription.timestamp.desc()).first()
    if not jd:
        return {"message": "No JD uploaded yet"}
    return jd
