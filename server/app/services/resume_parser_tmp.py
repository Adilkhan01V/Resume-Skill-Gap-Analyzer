import io
import re
from typing import List
from fastapi import UploadFile
from app.services import skill_extractor

PHONE_PATTERN = re.compile(r"(\+?\d[\d\s().-]{6,}\d)")
HEADER_PATTERNS = {
    "summary": re.compile(r'^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|ABOUT ME|ABOUT)\s*$', re.IGNORECASE),
    "skills": re.compile(r'^(SKILLS|TECHNICAL SKILLS|CORE SKILLS|TOOLS & TECHNOLOGIES|TECHNOLOGIES)\s*$', re.IGNORECASE),
    "experience": re.compile(r'^(PROFESSIONAL EXPERIENCE|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|HISTORY|CAREER SUMMARY)\s*$', re.IGNORECASE),
    "projects": re.compile(r'^(PROJECTS|PERSONAL PROJECTS|PORTFOLIO|TECHNICAL PROJECTS|RELEVANT PROJECTS)\s*$', re.IGNORECASE),
    "education": re.compile(r'^(EDUCATION|ACADEMICS|ACADEMIC BACKGROUND|SCHOLASTIC RECORD|QUALIFICATIONS)\s*$', re.IGNORECASE)
}


def extract_text(file: UploadFile) -> str:
    """Extract raw text from a PDF or DOCX file."""
    filename = file.filename or ""
    try:
        file.file.seek(0)
        content = file.file.read()
    except Exception as e:
        print(f"Error reading file content: {e}")
        return ""

    if not content:
        return ""

    try:
        if filename.lower().endswith(".pdf"):
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pages_text = []
                for page in pdf.pages:
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            pages_text.append(page_text)
                    except Exception as page_err:
                        print(f"Error extracting page text: {page_err}")
                        continue
                text = "\n".join(pages_text)
            if not text.strip():
                print(f"Warning: No text extracted from PDF {filename}")
        elif filename.lower().endswith((".docx", ".doc")):
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([para.text for para in doc.paragraphs])
        else:
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
        if filename.lower().endswith((".pdf", ".docx", ".doc")):
            text = ""
        else:
            text = content.decode("utf-8", errors="ignore")

    return text.strip()


def _split_blocks(lines: List[str]) -> List[str]:
    blocks = []
    buffer: List[str] = []
    for line in lines:
        if not line.strip():
            if buffer:
                blocks.append("\n".join(buffer).strip())
                buffer = []
            continue
        buffer.append(line)
    if buffer:
        blocks.append("\n".join(buffer).strip())
    return blocks


def _clean_section_lines(lines: List[str]) -> List[str]:
    cleaned = []
    skip_headers = {"SKILLS", "SUMMARY", "EXPERIENCE", "PROJECTS", "EDUCATION", "PROFILE", "ABOUT"}
    for line in lines:
        if not line.strip():
            continue
        if line.strip().upper() in skip_headers:
            continue
        cleaned.append(line.strip())
    return cleaned


def parse_resume(raw_text: str) -> dict:
    """Parse raw text into structured resume data using deterministic heuristics."""
    text = raw_text.replace("\r", "")
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line.strip()]

    name = lines[0] if lines else ""

    email = ""
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}', text)
    if email_match:
        email = email_match.group(0)

    phone = ""
    phone_match = PHONE_PATTERN.search(text)
    if phone_match:
        phone = phone_match.group(0).strip()

    sections = {"summary": [], "skills": [], "experience": [], "projects": [], "education": []}
    current_section = None
    top_lines: List[str] = []

    for line in lines:
        matched = False
        for sec, pattern in HEADER_PATTERNS.items():
            if pattern.match(line):
                current_section = sec
                matched = True
                break
        if matched:
            continue

        if current_section:
            sections[current_section].append(line)
        else:
            top_lines.append(line)

    summary_text = ""
    if sections["summary"]:
        summary_text = " ".join(_clean_section_lines(sections["summary"]))
    else:
        summary_candidates = []
        for line in top_lines[1:]:
            if email and email in line:
                continue
            if phone and phone in line:
                continue
            if re.match(r'^(SKILLS|SUMMARY|EXPERIENCE|PROJECTS|EDUCATION|PROFILE|ABOUT)', line, re.IGNORECASE):
                continue
            summary_candidates.append(line)
            if len(summary_candidates) >= 3:
                break
        summary_text = " ".join(summary_candidates)

    skills_text = "\n".join(sections["skills"]) if sections["skills"] else ""
    parsed_skills = []
    if skills_text:
        parsed_skills = skill_extractor.extract_skills(skills_text)

    experience_blocks = _split_blocks(_clean_section_lines(sections["experience"]))
    project_blocks = _split_blocks(_clean_section_lines(sections["projects"]))
    education_blocks = _split_blocks(_clean_section_lines(sections["education"]))

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "summary": summary_text,
        "skills": parsed_skills,
        "experience": experience_blocks,
        "projects": project_blocks,
        "education": education_blocks,
    }
