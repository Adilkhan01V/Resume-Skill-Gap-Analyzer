from fastapi import APIRouter, Response, HTTPException
from app.schemas.resume import ResumeData
from fastapi import APIRouter, Response, HTTPException
from app.schemas.resume import ResumeData
from app.services.export_service import generate_resume_pdf
import io

router = APIRouter()


@router.post("/export")
async def export_resume(resume_data: ResumeData, format: str = "pdf"):
    """
    Exports the provided resume data as a professional PDF or DOCX.
    """
    try:
        # We focus on PDF as per requirements, but the structure allows for expansion
        if format.lower() == "pdf":
            pdf_bytes = generate_resume_pdf(resume_data.model_dump())
            
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=resume_{resume_data.name or 'export'}.pdf"
                }
            )
        else:
            # Placeholder for other formats if needed later
            raise HTTPException(status_code=400, detail=f"Export format '{format}' not supported yet.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate {format}: {str(e)}")
