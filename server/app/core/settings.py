from pydantic import BaseModel


class AppSettings(BaseModel):
  app_name: str = "Resume Skill Gap Analyzer API"
  api_prefix: str = "/api"
