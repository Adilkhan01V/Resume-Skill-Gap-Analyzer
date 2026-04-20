from pydantic import BaseModel


class JobDescriptionModel(BaseModel):
  content: str | None = None
