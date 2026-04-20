from pydantic import BaseModel
from typing import List, Dict, Any

from .resume import ResumeData

class SkillConfidence(BaseModel):
    skill: str
    confidence: float
    type: str  # VERIFIED, DECLARED, AI_SUGGESTED

class ScoreResponse(BaseModel):
    overall_score: int
    improved_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    confidence_breakdown: List[SkillConfidence]
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    section_scores: Dict[str, int]

class RoadmapStep(BaseModel):
    week: str
    focus: str
    steps: List[str]

class ImprovementResponse(BaseModel):
    improved_resume: ResumeData
    suggestions: List[str]
    roadmap: List[RoadmapStep]
    explanation: str

class JobMatch(BaseModel):
    title: str
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    reason: str

class JobMatchResponse(BaseModel):
    matches: List[JobMatch]
