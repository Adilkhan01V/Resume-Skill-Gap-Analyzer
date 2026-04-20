from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import List, Optional, Any

from app.schemas.analysis import JobMatchResponse
from app.services import job_matcher

router = APIRouter()


class JobsRequest(BaseModel):
    resume_data: Any
    job_description: Optional[str] = ""


def _extract_skill_names(resume_data: Any) -> List[str]:
    """Extract skill name strings from a resume_data dict/object."""
    if isinstance(resume_data, dict):
        skills = resume_data.get("skills", [])
    elif hasattr(resume_data, "skills"):
        skills = resume_data.skills or []
    else:
        return []

    names = []
    for s in skills:
        if isinstance(s, dict):
            names.append(s.get("name", ""))
        elif isinstance(s, str):
            names.append(s)
        else:
            try:
                names.append(s.name)
            except AttributeError:
                pass
    return [n.strip() for n in names if n.strip()]


@router.post("/", response_model=JobMatchResponse)
async def get_job_matches(request: JobsRequest):
    """Match jobs based on a full resume payload (called immediately after /analyze)."""
    skill_names = _extract_skill_names(request.resume_data)
    matches = job_matcher.match_job_roles(skill_names)
    return JobMatchResponse(matches=matches)


@router.post("/match", response_model=JobMatchResponse)
async def match_jobs(skills: List[str] = Body(...)):
    """Match jobs based on a flat list of skill strings (legacy endpoint)."""
    matches = job_matcher.match_job_roles(skills)
    return JobMatchResponse(matches=matches)
