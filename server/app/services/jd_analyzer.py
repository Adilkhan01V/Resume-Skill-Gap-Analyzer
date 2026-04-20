import re
from typing import List

# Reuse Taxonomy for symmetry
# Ideally pulled from a DB or shared config but duplicating cleanly for this iteration
TAXONOMY = {
    "programming": ["python", "javascript", "ja va", "java", "c++", "c#", "go", "ruby", "rust", "typescript", "php", "swift", "kotlin", "ruby"],
    "frameworks": ["react", "angular", "vue", "django", "flask", "fastapi", "spring", "express", "laravel", "ruby on rails", "next.js", "node.js"],
    "tools": ["git", "docker", "kubernetes", "jenkins", "aws", "azure", "gcp", "terraform", "ansible", "ci/cd", "automation"],
    "databases": ["sql", "mysql", "postgresql", "mongodb", "redis", "cassandra", "elasticsearch", "sqlite"],
    "roles": ["frontend", "backend", "full stack", "full-stack", "mobile", "security", "devops", "qa", "testing", "product management", "ui/ux", "design", "web", "cloud", "analytics"]
}

ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "node": "node.js",
    "reactjs": "react",
    "nextjs": "next.js",
    "postgres": "postgresql",
    "golang": "go",
    "k8s": "kubernetes",
    "front end": "frontend",
    "back end": "backend",
    "web stack": "web",
    "dev ops": "devops",
    "project management": "product management",
    "machine learning": "machine learning",
    "data visualization": "analytics"
}

def normalize_skill_name(raw_name: str) -> str:
    cleaned = raw_name.lower().strip()
    norm = ALIASES.get(cleaned, cleaned)
    return norm.title() if len(norm) > 3 else norm.upper()

def extract_required_skills(job_description_text: str) -> List[str]:
    """Parse the job description and extract required skills using Taxonomy."""
    found_requirements = set()
    text_lower = job_description_text.lower()
    
    # We can split text to look around "preferred" vs "required" later. 
    # For now, extract all technical keywords deterministicly.
    for category, category_skills in TAXONOMY.items():
        for skill in category_skills:
            if skill in ['c++', 'c#', 'next.js', 'node.js']:
                escaped = re.escape(skill)
                pattern = rf"(?:^|\s){escaped}(?:\s|$)"
            else:
                pattern = rf"\b{re.escape(skill)}\b"
            
            if re.search(pattern, text_lower):
                std_name = normalize_skill_name(skill)
                found_requirements.add(std_name)
                
    if not found_requirements:
        fallback_keywords = [
            "frontend", "backend", "full stack", "full-stack", "web", "cloud", "automation",
            "security", "testing", "mobile", "product management", "design", "analytics",
            "ci/cd", "devops", "machine learning"
        ]
        for skill in fallback_keywords:
            if re.search(rf"\b{re.escape(skill)}\b", text_lower):
                normalized = normalize_skill_name(skill)
                found_requirements.add(normalized)

    return list(found_requirements)
