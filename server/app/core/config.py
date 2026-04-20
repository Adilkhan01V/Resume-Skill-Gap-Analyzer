import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Resume Skill Gap Analyzer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176", 
        "http://localhost:5177", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5176"
    ]

    # AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

    class Config:
        # Look for .env in the current directory, and also try the server directory specifically
        # as it's a common place for it in this project structure
        _base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        env_file = [
            os.path.join(_base_dir, ".env"),
            os.path.join(_base_dir, "server", ".env"),
            os.path.join(_base_dir, "server", "venv", ".env"), # Check where user said they put it
            ".env"
        ]
        case_sensitive = True

settings = Settings()
