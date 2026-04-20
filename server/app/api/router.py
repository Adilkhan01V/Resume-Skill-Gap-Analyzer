from fastapi import APIRouter
from app.api.routes import analyze, improve, score, jobs, export

api_router = APIRouter()
api_router.include_router(analyze.router, tags=["analyze"])
api_router.include_router(improve.router, tags=["improve"])
api_router.include_router(score.router, tags=["score"])
api_router.include_router(jobs.router, tags=["jobs"])
api_router.include_router(export.router, tags=["export"])
