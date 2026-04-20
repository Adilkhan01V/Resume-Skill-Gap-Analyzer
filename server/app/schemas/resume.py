from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any

class Skill(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    name: str
    category: Optional[str] = None
    level: Optional[str] = None

class ResumeData(BaseModel):
    """Structured resume data returned by the parser and used throughout the pipeline."""
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None      # full contact string: email + phone
    summary: Optional[str] = None      # professional summary paragraph
    skills: List[Skill] = []
    # experience / projects / education are lists of dicts parsed from the resume
    experience: List[Any] = []
    projects: List[Any] = []
    education: List[Any] = []
