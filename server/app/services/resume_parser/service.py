from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

def extract_text(file: UploadFile) -> str:
    """Extract text from uploaded PDF or DOCX file."""
    import io
    
    try:
        # Seek to beginning if already read
        file.file.seek(0)
        
        content = file.file.read()
        
        # Reset file pointer for potential reuse
        file.file.seek(0)
        
        content_type = file.content_type or ""
        
        if "pdf" in content_type.lower():
            return _extract_from_pdf(content)
        elif "word" in content_type.lower() or "document" in content_type.lower():
            return _extract_from_docx(content)
        else:
            # Try PDF first as fallback
            try:
                return _extract_from_pdf(content)
            except Exception:
                raise ValueError(f"Unsupported file type: {content_type}")
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        raise ValueError(f"Failed to extract text from file: {str(e)}")

def _extract_from_pdf(content: bytes) -> str:
    """Extract text from PDF using pdfplumber."""
    try:
        import pdfplumber
        import io
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            return "\n".join(pages_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

def _extract_from_docx(content: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        import io
        doc = Document(io.BytesIO(content))
        text = "\n".join(paragraph.text for paragraph in doc.paragraphs if paragraph.text)
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")

def parse_resume(raw_text: str) -> dict:
    """Parse resume text and extract structured data."""
    import re
    
    if not raw_text:
        return {
            "name": None,
            "email": None,
            "projects": [],
            "experience": [],
            "education": []
        }
    
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    
    # Extract name (usually first non-empty line)
    name = lines[0] if lines else None
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    email = None
    for line in lines:
        match = re.search(email_pattern, line)
        if match:
            email = match.group()
            break
    
    return {
        "name": name,
        "email": email,
        "projects": [],
        "experience": [],
        "education": []
    }