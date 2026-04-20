from fastapi import APIRouter

router = APIRouter()


@router.post("/analyze")
async def analyze_resume():
  return {"message": "Analyze endpoint placeholder"}
