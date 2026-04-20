def recommend_jobs_for_resume(resume_payload: dict, job_description: str) -> list[dict]:
    """Recommend jobs based on resume and job description."""
    # Placeholder implementation - return some sample jobs
    return [
        {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "matchPercentage": 85,
            "level": "Mid-level",
            "skillsMatched": ["Python", "JavaScript", "React"],
            "location": "Remote",
            "description": "Develop and maintain web applications using modern technologies."
        },
        {
            "title": "Frontend Developer",
            "company": "Startup Inc",
            "matchPercentage": 78,
            "level": "Junior",
            "skillsMatched": ["JavaScript", "React", "CSS"],
            "location": "San Francisco, CA",
            "description": "Build user interfaces for our SaaS platform."
        },
        {
            "title": "Full Stack Developer",
            "company": "Big Tech",
            "matchPercentage": 92,
            "level": "Senior",
            "skillsMatched": ["Python", "JavaScript", "Node.js", "PostgreSQL"],
            "location": "New York, NY",
            "description": "Lead development of scalable web applications."
        }
    ]
