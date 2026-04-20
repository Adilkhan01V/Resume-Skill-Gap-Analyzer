import io
import re
from typing import List, Optional
from fastapi import UploadFile
from app.services import skill_extractor

# ─────────────────────────────────────────────────────────────────────────────
# Regex patterns
# ─────────────────────────────────────────────────────────────────────────────

PHONE_PATTERN = re.compile(r"(\+?[\d][\d\s().+-]{6,}\d)")

HEADER_PATTERNS = {
    "summary": re.compile(
        r"^(SUMMARY|PROFESSIONAL\s+SUMMARY|PROFILE|ABOUT\s+ME|ABOUT|OBJECTIVE|CAREER\s+OBJECTIVE)\s*:?\s*$",
        re.IGNORECASE
    ),
    "skills": re.compile(
        r"^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+SKILLS|TOOLS\s*[&\u0026]\s*TECHNOLOGIES|TECHNOLOGIES|"
        r"KEY\s+SKILLS|COMPETENCIES|EXPERTISE)\s*:?\s*$",
        re.IGNORECASE
    ),
    "experience": re.compile(
        r"^(PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|HISTORY|"
        r"CAREER\s+SUMMARY|WORK\s+HISTORY|INTERNSHIPS?)\s*:?\s*$",
        re.IGNORECASE
    ),
    "projects": re.compile(
        r"^(PROJECTS|PERSONAL\s+PROJECTS|PORTFOLIO|TECHNICAL\s+PROJECTS|"
        r"RELEVANT\s+PROJECTS|ACADEMIC\s+PROJECTS|KEY\s+PROJECTS)\s*:?\s*$",
        re.IGNORECASE
    ),
    "education": re.compile(
        r"^(EDUCATION|ACADEMICS|ACADEMIC\s+BACKGROUND|SCHOLASTIC\s+RECORD|"
        r"QUALIFICATIONS|DEGREES?)\s*:?\s*$",
        re.IGNORECASE
    ),
}

DATE_PATTERN = re.compile(
    r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"
    r"January|February|March|April|June|July|August|September|October|November|December)"
    r"[\s.,']*\d{4}\b"
    r"|\b\d{4}\s*[-–]\s*(\d{4}|Present|Current|Now)\b",
    re.IGNORECASE
)

BULLET_PATTERN = re.compile(r"^[•\-\*\u2022\u2023\u25E6\u2043]\s*")

DEGREE_PATTERN = re.compile(
    r"^(Bachelor|Master|PhD|Ph\.D|Associate|B\.?Tech|M\.?Tech|B\.?E|M\.?E|"
    r"B\.?Sc|M\.?Sc|B\.?A|M\.?A|MBA|BBA|High School|Diploma)",
    re.IGNORECASE
)


# ─────────────────────────────────────────────────────────────────────────────
# Text extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_text(file: UploadFile) -> str:
    """Extract raw text from a PDF or DOCX file using PyMuPDF for PDFs."""
    filename = file.filename or ""
    try:
        file.file.seek(0)
        content = file.file.read()
    except Exception as e:
        print(f"[parser] Error reading file: {e}")
        return ""

    if not content:
        return ""

    try:
        if filename.lower().endswith(".pdf"):
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(stream=content, filetype="pdf")
                lines = []
                for page in doc:
                    # Extract as dict to get better line-by-line structure
                    blocks = page.get_text("dict")["blocks"]
                    for block in blocks:
                        if block.get("type") != 0:  # text block
                            continue
                        for line_obj in block.get("lines", []):
                            spans = line_obj.get("spans", [])
                            line_text = " ".join(s["text"] for s in spans).strip()
                            if line_text:
                                lines.append(line_text)
                doc.close()
                text = "\n".join(lines)
            except ImportError:
                print("[parser] Warning: PyMuPDF (fitz) not installed. Trying fallback...")
                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(content)) as pdf:
                        text = "\n".join(p.extract_text() or "" for p in pdf.pages)
                except ImportError:
                    print("[parser] Warning: pdfplumber not installed. Trying pypdf...")
                    try:
                        from pypdf import PdfReader
                        reader = PdfReader(io.BytesIO(content))
                        text = "\n".join(page.extract_text() or "" for page in reader.pages)
                    except ImportError:
                        print("[parser] Error: No PDF parser installed (pymupdf, pdfplumber, or pypdf).")
                        text = ""
                    except Exception as e:
                        print(f"[parser] pypdf fallback failed: {e}")
                        text = ""
                except Exception as e:
                    print(f"[parser] pdfplumber fallback failed: {e}")
                    text = ""
            
            if not text.strip():
                print(f"[parser] Warning: No text in PDF {filename}")

        elif filename.lower().endswith((".docx", ".doc")):
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join(para.text for para in doc.paragraphs)

        else:
            text = content.decode("utf-8", errors="ignore")

    except Exception as e:
        print(f"[parser] Error parsing {filename}: {e}")
        if filename.lower().endswith((".pdf", ".docx", ".doc")):
            # Fallback: raw byte decode
            text = content.decode("utf-8", errors="ignore")
        else:
            text = content.decode("utf-8", errors="ignore")

    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Section sub-parsers
# ─────────────────────────────────────────────────────────────────────────────

def _strip_bullet(line: str) -> str:
    return BULLET_PATTERN.sub("", line).strip()


def _is_bullet(line: str) -> bool:
    return bool(BULLET_PATTERN.match(line))


def _is_date_line(line: str) -> bool:
    return bool(DATE_PATTERN.search(line))


def _parse_experience(lines: List[str]) -> List[dict]:
    """
    Parse an experience section into structured job entries.
    Handles common resume formats:
      - Role on one line, Company on next, Date on next, then description lines
      - Bullet points with • - * or plain description lines
    """
    if not lines:
        return []

    jobs: List[List[str]] = []
    current: List[str] = []

    for line in lines:
        # A new job block starts on a short, title-case or ALL-CAPS line
        # that is NOT a bullet or date
        is_section_header = (
            not _is_bullet(line)
            and not _is_date_line(line)
            and len(line.split()) <= 6
            and line[0:1].isupper()
            and not line.endswith(":")
        )
        if is_section_header:
            if current:
                jobs.append(current)
            current = [line]
        else:
            current.append(line)

    if current:
        jobs.append(current)

    parsed = []
    for job in jobs:
        if not job:
            continue

        role = _strip_bullet(job[0])
        company = ""
        dates = ""
        points: List[str] = []

        # The first few lines after role are: company, dates, then description
        header_done = False
        for line in job[1:]:
            clean = _strip_bullet(line)
            if not clean:
                continue

            # Date lines
            if _is_date_line(line) and not dates:
                dates = clean
                header_done = True
                continue

            # Company (second line if we haven't set it and we're still in header)
            if not header_done and not company and not _is_bullet(line):
                company = clean
                continue

            # Everything else: description / bullet point
            points.append(clean)

        if role:
            parsed.append({
                "role": role,
                "company": company,
                "dates": dates,
                "points": points
            })

    return parsed



def _parse_projects(lines: List[str]) -> List[dict]:
    """Parse a projects section into structured project entries."""
    if not lines:
        return []

    projects: List[List[str]] = []
    current: List[str] = []

    for line in lines:
        if (
            not _is_bullet(line)
            and len(line.split()) <= 10
            and line[0:1].isupper()
            and not _is_date_line(line)
        ):
            if current:
                projects.append(current)
            current = [line]
        else:
            current.append(line)

    if current:
        projects.append(current)

    parsed = []
    for project in projects:
        if not project:
            continue

        name = _strip_bullet(project[0])
        description: List[str] = []
        tech: List[str] = []

        for line in project[1:]:
            clean = _strip_bullet(line)
            if not clean:
                continue
            lower = clean.lower()
            if "tech" in lower or "stack" in lower or "built with" in lower or "technologies" in lower:
                # Extract technologies after colon
                if ":" in clean:
                    tech_part = clean.split(":", 1)[1]
                    tech = [t.strip() for t in re.split(r"[,|]", tech_part) if t.strip()]
                else:
                    description.append(clean)
            else:
                description.append(clean)

        if name:
            parsed.append({
                "name": name,
                "description": description,
                "technologies": tech
            })

    return parsed


def _parse_education(lines: List[str]) -> List[dict]:
    """Parse an education section into structured entries."""
    if not lines:
        return []

    educations: List[List[str]] = []
    current: List[str] = []

    for line in lines:
        if DEGREE_PATTERN.match(line) or (
            not _is_bullet(line)
            and len(line.split()) <= 12
            and line[0:1].isupper()
            and not _is_date_line(line)
        ):
            if current:
                educations.append(current)
            current = [line]
        else:
            current.append(line)

    if current:
        educations.append(current)

    parsed = []
    for edu in educations:
        if not edu:
            continue

        degree = edu[0].strip()
        school = ""
        dates = ""

        for line in edu[1:]:
            clean = line.strip()
            if not clean:
                continue
            if _is_date_line(clean) and not dates:
                dates = clean
            elif not school:
                school = clean

        if degree:
            parsed.append({
                "degree": degree,
                "school": school,
                "dates": dates
            })

    return parsed


# ─────────────────────────────────────────────────────────────────────────────
# Main parser
# ─────────────────────────────────────────────────────────────────────────────

def parse_resume(raw_text: str) -> dict:
    """
    Parse raw resume text into a structured dict.
    Returns:
        {
          name, email, phone, contact, summary,
          skills: [Skill(...)],
          experience: [{role, company, dates, points[]}],
          projects: [{name, description[], technologies[]}],
          education: [{degree, school, dates}],
        }
    """
    text = raw_text.replace("\r", "")
    # Clean up lines, preserve structure
    all_lines = [line.strip() for line in text.splitlines()]
    lines = [l for l in all_lines if l]  # non-empty lines only

    # ── Contact info ──────────────────────────────────────────────────────────
    name = lines[0] if lines else ""

    email = ""
    email_match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,}", text)
    if email_match:
        email = email_match.group(0)

    phone = ""
    phone_match = PHONE_PATTERN.search(text)
    if phone_match:
        phone = phone_match.group(0).strip()

    # Build contact string
    contact_parts = [p for p in [email, phone] if p]
    contact = " | ".join(contact_parts)

    # ── Section segmentation ─────────────────────────────────────────────────
    sections: dict = {"summary": [], "skills": [], "experience": [], "projects": [], "education": []}
    current_section: Optional[str] = None

    for line in lines[1:]:  # skip name line
        # Try to match a section header (stripped of trailing colons/spaces)
        matched_section = None
        for sec, pattern in HEADER_PATTERNS.items():
            if pattern.match(line):
                matched_section = sec
                break

        if matched_section:
            current_section = matched_section
            continue

        if current_section:
            sections[current_section].append(line)

    # ── Fallback: if no sections detected, dump everything into summary ───────
    no_sections = all(len(v) == 0 for v in sections.values())
    if no_sections and lines:
        print("[parser] No sections detected — falling back to full-text summary")
        sections["summary"] = lines[1:]  # skip name

    # ── Parse each section ────────────────────────────────────────────────────
    summary = " ".join(sections["summary"]) if sections["summary"] else ""

    # Skills: extract from skills section text
    skills_raw_text = "\n".join(sections["skills"])
    skills = skill_extractor.extract_skills(skills_raw_text)

    experience = _parse_experience(sections["experience"])
    projects = _parse_projects(sections["projects"])
    education = _parse_education(sections["education"])

    # Additional skills from experience bullet points
    if experience:
        for exp in experience:
            points_text = " ".join(exp.get("points", []))
            extra = skill_extractor.extract_skills(points_text)
            skills.extend(extra)

    # Additional skills from projects
    if projects:
        for proj in projects:
            tech_text = " ".join(proj.get("technologies", []) + proj.get("description", []))
            extra = skill_extractor.extract_skills(tech_text)
            skills.extend(extra)

    # Deduplicate skills by name
    seen = set()
    unique_skills = []
    for s in skills:
        key = s.name.lower()
        if key not in seen:
            seen.add(key)
            unique_skills.append(s)

    print(f"[parser] name={name!r} | skills={len(unique_skills)} | "
          f"exp={len(experience)} | proj={len(projects)} | edu={len(education)}")

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "contact": contact,
        "summary": summary,
        "skills": unique_skills,
        "experience": experience,
        "projects": projects,
        "education": education,
    }
