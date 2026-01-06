from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
try:
    from .database import Base
except ImportError:
    from database import Base

class Resume(Base):
    __tablename__ = 'resumes'
    id = Column(Integer, primary_key=True, index=True)
    job_description_id = Column(Integer, ForeignKey('job_descriptions.id'))
    filename = Column(String)
    raw_text = Column(Text)
    parsed_json = Column(JSON)  # Stores extracted skills, exp, etc.
    score_json = Column(JSON)   # Stores calculated scores
    verdict = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job_description = relationship("JobDescription", back_populates="resumes")

class JobDescription(Base):
    __tablename__ = 'job_descriptions'
    id = Column(Integer, primary_key=True, index=True)
    role_title = Column(String) # e.g. "Senior Python Dev"
    filename = Column(String)
    raw_text = Column(Text)
    parsed_json = Column(JSON)  # Stores required skills, exp, etc.
    timestamp = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="job_description")
