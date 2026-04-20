import re
import math
from typing import List, Dict, Tuple, Any
from app.schemas.resume import Skill

# Rebalanced Weights
WEIGHT_SKILL = 0.70
WEIGHT_EVIDENCE = 0.10
WEIGHT_ATS = 0.10
WEIGHT_SEMANTIC = 0.10


def normalize_skill(skill: str) -> str:
    """Aggressive normalization map for common variations and punctuation."""
    s = skill.lower().strip()
    s = re.sub(r'[^a-z0-9\s\.\+\#]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()

    mapping = {
        "js": "javascript",
        "reactjs": "react",
        "react.js": "react",
        "nodejs": "node.js",
        "node": "node.js",
        "nodjs": "node.js",
        "expressjs": "express",
        "vuejs": "vue",
        "vue.js": "vue",
        "nextjs": "next.js",
        "nuxtjs": "nuxt.js",
        "nestjs": "nest.js",
        "ts": "typescript",
        "golang": "go",
        "amazon web services": "aws",
        "google cloud": "gcp",
        "google cloud platform": "gcp",
        "k8s": "kubernetes",
        "postgres": "postgresql",
        "mongo": "mongodb",
        "scikit": "scikit-learn",
        "sklearn": "scikit-learn",
        "rest apis": "rest",
        "rest api": "rest",
        "restful": "rest",
    }
    return mapping.get(s, s)


def _flatten_text(items: List[Any]) -> str:
    """
    Flatten a list that may contain strings or dicts (experience/project/education entries)
    into a single lowercase text block for keyword matching.
    """
    parts = []
    for item in items:
        if isinstance(item, str):
            parts.append(item)
        elif isinstance(item, dict):
            # Gather all string values recursively
            for v in item.values():
                if isinstance(v, str):
                    parts.append(v)
                elif isinstance(v, list):
                    for sub in v:
                        if isinstance(sub, str):
                            parts.append(sub)
        # Pydantic model
        elif hasattr(item, '__dict__'):
            parts.append(str(item))
    return " ".join(parts).lower()


def match_skills(resume_skills: List[Any], required_skills: List[str]) -> Tuple[List[str], List[str]]:
    """Fuzzy matching allowing partial overlaps."""
    matched = []
    missing = []

    res_normalized = []
    for s in resume_skills:
        if isinstance(s, dict):
            res_normalized.append(normalize_skill(s.get("name", "")))
        elif isinstance(s, str):
            res_normalized.append(normalize_skill(s))
        else:
            try:
                res_normalized.append(normalize_skill(s.name))
            except AttributeError:
                pass

    # Limit JD skills to top 10 relevant to prevent math dilution
    target_skills = required_skills[:10]

    for req in target_skills:
        req_norm = normalize_skill(req)

        # Skip generic role names that aren't actual skills
        role_terms = {"frontend", "backend", "full stack", "fullstack", "full-stack", "mobile",
                      "web", "cloud", "devops", "design", "security", "testing", "qa", "analytics"}
        if req_norm in role_terms:
            continue

        is_matched = False
        for r_norm in res_normalized:
            # Exact match
            if req_norm == r_norm:
                is_matched = True
                break
            # Word-level containment (e.g. "sql" in "sql" or "react" matching "react")
            if req_norm in r_norm.split() or r_norm in req_norm.split():
                is_matched = True
                break
            # Substring match for multi-word skills (e.g. "node.js" in "node.js")
            if len(req_norm) > 2 and (req_norm in r_norm or r_norm in req_norm):
                is_matched = True
                break

        if is_matched:
            matched.append(req)
        else:
            missing.append(req)

    return matched, missing


def classify_skill(skill: str, resume_data: dict) -> dict:
    """Classify a skill based on evidence in the resume."""
    norm_skill = normalize_skill(skill)

    # Build text from projects and experience (handle both str and dict entries)
    experience_items = resume_data.get("experience", [])
    project_items = resume_data.get("projects", [])
    evidence_text = _flatten_text(experience_items + project_items)
    evidence_text_clean = re.sub(r'[^\w\s]', '', evidence_text)

    # VERIFIED: appears in experience or projects text
    if norm_skill in evidence_text_clean.split() or norm_skill in evidence_text:
        return {"skill": skill, "confidence": 0.95, "type": "VERIFIED"}

    # DECLARED: appears in skills section only
    resume_skills = []
    for s in resume_data.get("skills", []):
        if isinstance(s, dict):
            resume_skills.append(normalize_skill(s.get("name", "")))
        elif isinstance(s, str):
            resume_skills.append(normalize_skill(s))
        else:
            try:
                resume_skills.append(normalize_skill(s.name))
            except AttributeError:
                pass

    if norm_skill in resume_skills:
        return {"skill": skill, "confidence": 0.70, "type": "DECLARED"}

    # AI_SUGGESTED
    return {"skill": skill, "confidence": 0.40, "type": "AI_SUGGESTED"}


def get_scoring_payload(resume_data: dict, jd_text: str, required_skills: List[str]) -> dict:
    """Calculate fully weighted score, returning shaped dict payload."""
    resume_skills = resume_data.get("skills", [])
    matched_skills, missing_skills = match_skills(resume_skills, required_skills)

    # --- Skill Confidence & Classification ---
    confidence_breakdown = []
    total_confidence = 0

    for skill in matched_skills:
        classification = classify_skill(skill, resume_data)
        confidence_breakdown.append(classification)
        total_confidence += classification["confidence"]

    # --- Explainability ---
    strengths = []
    weaknesses = []
    improvements = []

    verified_count = sum(1 for c in confidence_breakdown if c["type"] == "VERIFIED")
    if verified_count > 3:
        strengths.append(f"Strong evidence found for {verified_count} core technical skills.")

    declared_only = [c["skill"] for c in confidence_breakdown if c["type"] == "DECLARED"]
    if declared_only:
        weaknesses.append(f"Skills like {', '.join(declared_only[:2])} are declared but lack project evidence.")
        improvements.append(f"Add specific bullet points describing how you used {declared_only[0]}.")

    if not matched_skills:
        weaknesses.append("Resume does not align with the core technical requirements of this role.")

    if missing_skills:
        improvements.append(f"Consider learning or highlighting: {', '.join(missing_skills[:3])}.")

    # --- Skill Score (70%) ---
    target_len = min(len(required_skills), 10)
    skill_score = 0
    if target_len > 0:
        raw_confidence_pct = (total_confidence / target_len) * 100
        skill_score = min(100, int(raw_confidence_pct * 1.1))
    else:
        skill_score = 100

    # --- Evidence Score (10%) ---
    evidence_score = 0
    if matched_skills:
        evidence_score = int((verified_count / len(matched_skills)) * 100)
    else:
        evidence_score = 50

    # --- ATS Score (10%) ---
    experience_items = resume_data.get("experience", [])
    ats_score = 0
    action_verbs = ["led", "developed", "managed", "created", "designed", "architected",
                    "built", "implemented", "optimized", "delivered", "launched", "reduced"]
    if experience_items:
        exp_text = _flatten_text(experience_items)
        verb_count = sum(1 for v in action_verbs if v in exp_text)
        ats_score = min(100, int((verb_count / max(len(action_verbs), 1)) * 200))
    else:
        ats_score = 40

    # --- Semantic Score (10%) ---
    semantic_score = 0
    all_items = resume_data.get("experience", []) + resume_data.get("projects", [])
    resume_text = _flatten_text(all_items)
    res_words = set(re.findall(r'\b\w+\b', resume_text))
    jd_words = set(re.findall(r'\b\w+\b', jd_text.lower()))
    if jd_words:
        overlap = len(res_words.intersection(jd_words))
        semantic_score = min(100, int((overlap / min(len(jd_words), 50)) * 100))

    # --- Final Score ---
    raw_overall_score = int(
        (skill_score * WEIGHT_SKILL) +
        (evidence_score * WEIGHT_EVIDENCE) +
        (ats_score * WEIGHT_ATS) +
        (semantic_score * WEIGHT_SEMANTIC)
    )

    overall_score = raw_overall_score
    if overall_score < 30:
        overall_score = 30 + int(overall_score * 0.5)
    elif overall_score > 85 and verified_count < 3:
        overall_score = 85

    overall_score = min(overall_score, 96)
    improved_score = min(overall_score + 15, 98)

    return {
        "overall_score": overall_score,
        "improved_score": improved_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "confidence_breakdown": confidence_breakdown,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvements": improvements,
        "section_scores": {
            "skill": skill_score,
            "evidence": evidence_score,
            "ats": ats_score,
            "semantic": semantic_score
        }
    }
