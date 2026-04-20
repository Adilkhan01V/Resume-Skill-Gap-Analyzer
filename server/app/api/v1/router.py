from fastapi import APIRouter

from app.api.v1.endpoints import analysis, jobs, export

api_router = APIRouter()

api_router.include_router(analysis.router, tags=["Analysis"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
