from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
  resume_text: str
  job_description_text: str


class AnalyzeResponse(BaseModel):
  message: str
