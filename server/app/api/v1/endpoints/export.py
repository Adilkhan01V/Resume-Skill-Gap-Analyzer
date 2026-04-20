from fastapi import APIRouter, Response, Body, HTTPException
from app.schemas.resume import ResumeData
from app.services import export_service

router = APIRouter()

@router.post("/")
async def export_resume(resume_data: ResumeData = Body(...), format: str = "pdf"):
    """Export the edited resume to PDF or DOCX."""
    try:
        resume_dict = resume_data.model_dump()
        
        if format.lower() == "docx":
            # Note: docx generation is currently a placeholder or simple implementation
            content = export_service.generate_resume_docx(resume_dict)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"resume_{resume_data.name or 'export'}.docx"
        else:
            content = export_service.generate_resume_pdf(resume_dict)
            media_type = "application/pdf"
            filename = f"resume_{resume_data.name or 'export'}.pdf"
            
        return Response(
            content=content,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except RuntimeError as e:
        # Catch our custom missing-dependency error
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
