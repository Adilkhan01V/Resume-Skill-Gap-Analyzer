from pydantic import BaseModel


class ResumeModel(BaseModel):
  raw_text: str | None = None
