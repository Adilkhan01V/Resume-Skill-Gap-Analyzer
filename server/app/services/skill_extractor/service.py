import re
from typing import List
from app.schemas.resume import Skill

# Common technical skills taxonomy for matching
TECH_SKILLS = {
    # Programming languages
    "python", "javascript", "java", "c++", "c#", "go", "ruby", "rust", "typescript", "php", "swift", "kotlin", "scala", "perl", "r", "matlab",
    # Frontend frameworks
    "react", "angular", "vue", "jquery", "bootstrap", "tailwind", "next.js", "nuxt", "svelte", "blazor",
    # Backend frameworks  
    "django", "flask", "fastapi", "spring", "express", "laravel", "ruby on rails", "nestjs", "asp.net", "gin",
    # Databases
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "cassandra", "elasticsearch", "sqlite", "oracle", "mariadb", "dynamodb",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "jenkins", "travis", "circleci", "terraform", "ansible", "puppet", "chef",
    # Tools & Others
    "git", "github", "gitlab", "jira", "confluence", "figma", "sketch", "photoshop", "illustrator", 
    # ML/AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "pandas", "numpy", "scikit-learn", "nlp", "computer vision",
    # Soft skills
    "agile", "scrum", "kanban", "jira", "confluence", "communication", "leadership", "problem solving",
    # Other tech
    "rest", "graphql", "api", "microservices", "oauth", "jwt", "ci/cd", "linux", "unix", "bash", "powershell", "html", "css", "sass", "less"
}

def extract_skills(text: str) -> List[Skill]:
    """Extract technical skills from resume text."""
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = set()
    
    # Find all matches
    for skill in TECH_SKILLS:
        pattern = rf'\b{re.escape(skill)}\b'
        if re.search(pattern, text_lower):
            # Normalize skill name
            normalized = skill.title() if len(skill) > 3 else skill.upper()
            if skill == "postgresql":
                normalized = "PostgreSQL"
            elif skill == "mongodb":
                normalized = "MongoDB"
            elif skill == "mysql":
                normalized = "MySQL"
            elif skill == "aws":
                normalized = "AWS"
            elif skill == "gcp":
                normalized = "GCP"
            elif skill == "javascript":
                normalized = "JavaScript"
            elif skill == "typescript":
                normalized = "TypeScript"
            elif skill == "python":
                normalized = "Python"
            found_skills.add(normalized)
    
    # Convert to Skill objects
    skills = [Skill(name=s) for s in sorted(found_skills)]
    return skills
