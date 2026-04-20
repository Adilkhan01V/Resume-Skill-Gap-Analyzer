from fastapi import APIRouter

router = APIRouter()


@router.post("/score")
async def score_resume():
  return {"message": "Score endpoint placeholder"}
