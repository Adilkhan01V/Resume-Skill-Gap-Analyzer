from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ScoreResponse(BaseModel):
    overall_score: int
    improved_score: int
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    confidence_breakdown: List[Dict[str, Any]] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvements: List[str] = []
    section_scores: Optional[Dict[str, Any]] = None
