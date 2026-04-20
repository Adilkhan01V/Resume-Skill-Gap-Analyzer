from typing import List, Dict
from app.services.scoring_engine import normalize_skill

# Predefined Job Role Dataset
JOB_ROLES = [
    {
        "title": "Frontend Developer",
        "required_skills": ["React", "JavaScript", "HTML", "CSS"],
        "optional_skills": ["TypeScript", "Redux", "Tailwind"]
    },
    {
        "title": "Backend Developer",
        "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL"],
        "optional_skills": ["Docker", "Redis", "Node.js"]
    },
    {
        "title": "Full Stack Developer",
        "required_skills": ["React", "Node.js", "JavaScript", "SQL"],
        "optional_skills": ["TypeScript", "AWS", "Express"]
    },
    {
        "title": "Machine Learning Engineer",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-learn"],
        "optional_skills": ["Pandas", "NumPy", "Keras"]
    },
    {
        "title": "DevOps Engineer",
        "required_skills": ["Docker", "Kubernetes", "AWS", "Linux"],
        "optional_skills": ["Terraform", "CI/CD", "Jenkins"]
    },
    {
        "title": "Data Scientist",
        "required_skills": ["Python", "SQL", "Statistics", "Machine Learning"],
        "optional_skills": ["R", "Tableau", "PowerBI"]
    }
]

def match_job_roles(resume_skills: List[str]) -> List[Dict]:
    """Match resume skills against the job role dataset and return match results."""
    matches = []
    
    # Normalize resume skills for matching
    norm_resume_skills = [normalize_skill(s) for s in resume_skills]
    
    for job in JOB_ROLES:
        matched_required = []
        missing_required = []
        
        # Check required skills
        for req in job["required_skills"]:
            if normalize_skill(req) in norm_resume_skills:
                matched_required.append(req)
            else:
                missing_required.append(req)
        
        # Check optional skills (bonus)
        matched_optional = []
        for opt in job["optional_skills"]:
            if normalize_skill(opt) in norm_resume_skills:
                matched_optional.append(opt)
        
        # Calculate match percentage
        # Required skills carry the bulk of the weight (80%)
        # Optional skills provide a bonus (up to 20%)
        required_count = len(job["required_skills"])
        if required_count > 0:
            required_score = (len(matched_required) / required_count) * 80
        else:
            required_score = 80
            
        optional_count = len(job["optional_skills"])
        if optional_count > 0:
            optional_score = (len(matched_optional) / optional_count) * 20
        else:
            optional_score = 20
            
        match_percentage = int(required_score + optional_score)
        
        # Generate reason
        reason = ""
        if match_percentage >= 80:
            reason = f"Excellent fit! Strong alignment with {', '.join(matched_required[:2])} requirements."
        elif match_percentage >= 50:
            reason = f"Good match based on your {', '.join(matched_required[:1])} experience."
        else:
            reason = f"Potential match if you develop skills in {', '.join(missing_required[:2])}."
            
        matches.append({
            "title": job["title"],
            "match_percentage": match_percentage,
            "matched_skills": matched_required + matched_optional,
            "missing_skills": missing_required,
            "reason": reason
        })
    
    # Sort matches by percentage descending
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return matches
