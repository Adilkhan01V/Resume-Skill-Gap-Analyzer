import json
import logging
import os
import warnings
from typing import Dict, Any, List

# Suppress the google.generativeai deprecation warning for now
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Load the API key and model from settings
GEMINI_API_KEY = settings.GEMINI_API_KEY
GEMINI_MODEL = settings.GEMINI_MODEL

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_ai_response(resume_text: str, job_description: str, missing_skills: List[str] = None) -> Dict[str, Any]:
    """
    Centralized AI service to handle all AI requests via Gemini.
    """
    missing_skills_str = ", ".join(missing_skills) if missing_skills else "None specified"
    return _call_gemini(resume_text, job_description, missing_skills_str)

def _call_gemini(resume_text: str, job_description: str, missing_skills_str: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Using fallback mock data.")
        return _get_mock_data(resume_text, "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.")

    try:
        generation_config = {
            "temperature": 0.3,
            "response_mime_type": "application/json",
        }

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=generation_config,
            system_instruction="You are a world-class Professional Resume Writer and Technical Recruiter. Output only valid JSON."
        )

        prompt = f"""
        TASK:
        1. REPHRASE the Professional Summary to be more impactful, concise, and tailored to the Job Description.
        2. REPHRASE all Experience and Project descriptions. Use action verbs, quantify achievements (e.g., "Increased efficiency by 20%"), and ensure they are ATS-optimized.
        3. Identify missing skills from the Job Description and suggest how to bridge them.
        4. Generate a 4-week learning roadmap for the most critical missing skills.
        
        INPUT DATA:
        RESUME (JSON):
        {resume_text}
        
        JOB DESCRIPTION:
        {job_description}
        
        MISSING SKILLS:
        {missing_skills_str}

        OUTPUT REQUIREMENTS:
        - Return ONLY valid JSON.
        - Do NOT include markdown code blocks or explanations.
        - The "improved_resume" MUST follow the exact structure of the input Resume JSON but with rephrased content.
        - The "explanation" should be a professional analysis of why the candidate is a match or what they are missing.
        - The "suggestions" should be a list of at least 6-8 highly specific, actionable optimization points. Each suggestion should follow the format "Category: Detail" (e.g., "Impact: Quantify your role in the X project...").
        - The "suggestions" should cover: ATS Optimization, Action Verbs, Formatting, Quantifiable Achievements, and Skill Alignment.
        
        JSON FORMAT:
        {{
            "improved_resume": {{
                "name": "...",
                "email": "...",
                "contact": "...",
                "summary": "...",
                "skills": [{{"name": "...", "category": "..."}}],
                "experience": [{{"role": "...", "company": "...", "dates": "...", "points": ["..."]}}],
                "education": [{{"degree": "...", "school": "...", "dates": "..."}}],
                "projects": [{{"name": "...", "description": ["..."], "technologies": ["..."]}}]
            }},
            "suggestions": ["suggestion 1", "suggestion 2"],
            "explanation": "Professional analysis of the profile.",
            "roadmap": [
                {{
                    "week": "Week 1",
                    "focus": "topic",
                    "steps": ["step 1", "step 2"]
                }}
            ]
        }}
        """

        logger.info(f"Sending request to Gemini API ({GEMINI_MODEL})...")
        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        content = response.text
        logger.info(f"Raw Gemini output received (length: {len(content)})")
        
        # Clean up markdown code blocks if they exist
        if "```" in content:
            # Try to extract content between ```json and ``` or just ``` and ```
            import re
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
            if json_match:
                content = json_match.group(1)
        
        content = content.strip()
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # If there's extra data, try to extract only the first JSON object
            if "Extra data" in str(e):
                logger.warning(f"Detected extra data in JSON response. Attempting to extract first JSON object.")
                # Basic balance-checking for braces
                start_idx = content.find('{')
                if start_idx != -1:
                    depth = 0
                    for i in range(start_idx, len(content)):
                        if content[i] == '{':
                            depth += 1
                        elif content[i] == '}':
                            depth -= 1
                            if depth == 0:
                                trimmed_content = content[start_idx : i+1]
                                try:
                                    return json.loads(trimmed_content)
                                except:
                                    pass
            
            # If we still can't parse it, log the first part of the content for debugging
            logger.error(f"JSON Parsing failed. Error: {str(e)}. Content starts with: {content[:200]}...")
            raise e
        
    except Exception as e:
        logger.error(f"Gemini API call failed: {str(e)}")
        error_msg = f"Gemini API Error: {str(e)}"
        return _get_mock_data(resume_text, error_msg)

def _get_mock_data(resume_text: str, error_detail: str = None) -> Dict[str, Any]:
    logger.info("Returning mock data fallback.")
    
    try:
        original_resume = json.loads(resume_text)
        improved_resume = original_resume
    except Exception as e:
        logger.error(f"Failed to parse resume_text for mock fallback: {e}")
        improved_resume = {
            "name": "User",
            "email": "",
            "contact": "",
            "summary": "Professional background details.",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": []
        }

    explanation = error_detail if error_detail else "Your background matches the core requirements, but there are opportunities to better highlight your expertise in certain specialized areas mentioned in the job description."

    return {
        "improved_resume": improved_resume,
        "suggestions": [
            "Impact: Quantify your achievements in your experience section (e.g., 'Architected a system that reduced latency by 30%').",
            "Action Verbs: Use stronger power verbs like 'Spearheaded', 'Optimized', and 'Orchestrated' to start your bullet points.",
            "ATS Optimization: Integrate key technical terms from the job description directly into your skills and summary sections.",
            "Formatting: Ensure consistent date formatting and bullet point indentation across all professional experience entries.",
            "Summary: Tailor your professional summary to highlight the top 3 requirements mentioned in the job description.",
            "Skills: Categorize your technical skills into 'Core' and 'Familiar' to give recruiters a better sense of your expertise.",
            "Projects: Add a 'Technologies' line for each project to improve keyword density for automated resume scanners."
        ],
        "explanation": explanation,
        "roadmap": [
            {
                "week": "Week 1",
                "focus": "Core Competencies",
                "steps": ["Review foundational concepts", "Complete a mini-project using the target stack"]
            },
            {
                "week": "Week 2",
                "focus": "Advanced Integration",
                "steps": ["Implement advanced patterns", "Optimize performance and security"]
            }
        ]
    }
