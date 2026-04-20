from fastapi import APIRouter, UploadFile, File, Form, Body, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.schemas.resume import ResumeData, Skill
from app.schemas.analysis import ScoreResponse, ImprovementResponse

from app.services import resume_parser
from app.services import skill_extractor
from app.services import jd_analyzer
from app.services import scoring_engine
from app.services import ai_service
import json

logger = logging.getLogger(__name__)
router = APIRouter()


class ScoreRequest(BaseModel):
    resume_data: ResumeData
    job_description: str


class ImproveRequest(BaseModel):
    resume_data: ResumeData
    job_description: str
    missing_skills: List[str] = []


@router.post("/analyze", response_model=ResumeData)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """Extract and parse a resume file, returning fully structured JSON."""
    try:
        raw_text = resume_parser.extract_text(file)
        logger.info(f"Extracted text length: {len(raw_text)} chars")
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

    try:
        parsed_data = resume_parser.parse_resume(raw_text)
        logger.info(f"Parsed sections: {list(parsed_data.keys())}")
        logger.info(f"Skills found: {len(parsed_data.get('skills', []))}")
        logger.info(f"Experience entries: {len(parsed_data.get('experience', []))}")
    except Exception as e:
        logger.error(f"Resume parse error: {e}")
        parsed_data = {
            "name": None, "email": None, "contact": None, "summary": None,
            "skills": [], "projects": [], "experience": [], "education": []
        }

    # Skills from parser are already Skill objects — no need to re-extract from raw text
    resume_skills = parsed_data.get("skills", [])
    if not resume_skills:
        # Fallback: extract from full text if parser found nothing
        try:
            resume_skills = skill_extractor.extract_skills(raw_text)
            logger.info(f"Fallback skill extraction: {len(resume_skills)} skills")
        except Exception as e:
            logger.error(f"Skill extraction fallback error: {e}")
            resume_skills = []

    return ResumeData(
        name=parsed_data.get("name"),
        email=parsed_data.get("email"),
        contact=parsed_data.get("contact"),
        summary=parsed_data.get("summary"),
        skills=resume_skills,
        experience=parsed_data.get("experience", []),
        projects=parsed_data.get("projects", []),
        education=parsed_data.get("education", []),
    )


@router.post("/score", response_model=ScoreResponse)
async def score_resume(request: ScoreRequest):
    """Score the parsed resume against the job description."""
    jd_skills = jd_analyzer.extract_required_skills(request.job_description)
    payload = scoring_engine.get_scoring_payload(
        request.resume_data.model_dump(), request.job_description, jd_skills
    )
    return ScoreResponse(**payload)


@router.post("/improve", response_model=ImprovementResponse)
async def improve_resume(request: ImproveRequest):
    """Generate AI-based improvements for the resume."""
    logger.info("Received request for /improve endpoint.")
    try:
        resume_text_dump = request.resume_data.model_dump()
        ai_result = ai_service.generate_ai_response(
            json.dumps(resume_text_dump),
            request.job_description,
            request.missing_skills
        )
        
        improved_resume = ai_result.get("improved_resume", resume_text_dump)
        suggestions = ai_result.get("suggestions", [])
        roadmap = ai_result.get("roadmap", [])
        explanation = ai_result.get("explanation", "No skill gap explanation generated.")
        
        logger.info("Successfully generated AI response. Sending back to client.")
        
        return ImprovementResponse(
            improved_resume=ResumeData(**improved_resume),
            suggestions=suggestions,
            roadmap=roadmap,
            explanation=explanation
        )
    except Exception as e:
        logger.error(f"Error in /improve endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
