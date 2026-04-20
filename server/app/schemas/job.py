from pydantic import BaseModel
from typing import List, Optional

class JobDescription(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: str
    required_skills: List[str] = []

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    match_percentage: float
    url: Optional[str] = None
