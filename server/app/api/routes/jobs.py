from fastapi import APIRouter, Body
from app.services import job_matcher

router = APIRouter()


@router.post("/jobs")
async def recommend_jobs(resume_data: dict = Body(...), job_description: str = Body(...)):
    jobs = job_matcher.recommend_jobs_for_resume(resume_data, job_description)
    return {"jobs": jobs}
