from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.v1.router import api_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend foundation for Resume Skill Gap Analyzer"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def validate_configuration():
    """Validate optional configuration on startup."""
    if not settings.GEMINI_API_KEY:
        logger.warning(
            "GEMINI_API_KEY is not set. The server will start, but AI-powered resume improvement will be disabled. "
            "Set GEMINI_API_KEY in server/.env or as an environment variable to enable full AI features."
        )
    else:
        logger.info("✓ Configuration validated successfully")
        logger.info(f"✓ Using Gemini model: {settings.GEMINI_MODEL}")

@app.get("/")
async def root():
    return {"message": "Welcome to the Resume Skill Gap Analyzer API"}

