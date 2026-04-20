import re
from typing import List
from app.schemas.resume import Skill

# ─────────────────────────────────────────────────────────────────────────────
# Expanded taxonomy — grouped by category
# ─────────────────────────────────────────────────────────────────────────────

TAXONOMY = {
    "programming": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
        "ruby", "rust", "php", "swift", "kotlin", "scala", "r", "matlab",
        "bash", "shell", "perl", "dart", "elixir", "haskell", "lua"
    ],
    "frameworks": [
        "react", "angular", "vue", "next.js", "nuxt.js", "svelte",
        "django", "flask", "fastapi", "spring", "express", "nest.js",
        "laravel", "rails", "ruby on rails", "asp.net", "blazor",
        "node.js", "deno", "bun",
        "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
        "hugging face", "langchain", "openai",
    ],
    "databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "cassandra",
        "elasticsearch", "sqlite", "dynamodb", "firebase", "supabase",
        "bigquery", "snowflake", "mariadb", "oracle", "ms sql"
    ],
    "tools": [
        "git", "github", "gitlab", "bitbucket",
        "docker", "kubernetes", "terraform", "ansible", "vagrant",
        "jenkins", "github actions", "circleci", "travis ci",
        "aws", "azure", "gcp", "heroku", "vercel", "netlify",
        "linux", "unix", "nginx", "apache",
        "figma", "postman", "jira", "confluence", "notion",
        "graphql", "rest", "grpc", "websocket",
        "webpack", "vite", "babel", "eslint",
    ],
    "markup_style": [
        "html", "css", "sass", "scss", "tailwind", "bootstrap",
        "material ui", "chakra ui", "antd",
    ],
    "concepts": [
        "machine learning", "deep learning", "nlp", "computer vision",
        "data science", "data engineering", "devops", "ci/cd",
        "microservices", "agile", "scrum", "kanban",
        "object oriented", "functional programming", "system design",
        "test driven development", "tdd",
    ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Alias normalization — maps raw variants to canonical names
# ─────────────────────────────────────────────────────────────────────────────

ALIASES: dict = {
    # JavaScript ecosystem
    "js": "javascript",
    "ts": "typescript",
    "es6": "javascript",
    "nodejs": "node.js",
    "node": "node.js",
    "reactjs": "react",
    "react.js": "react",
    "vuejs": "vue",
    "vue.js": "vue",
    "nextjs": "next.js",
    "nuxtjs": "nuxt.js",
    "expressjs": "express",
    "nestjs": "nest.js",

    # Python ecosystem
    "sklearn": "scikit-learn",
    "scikit": "scikit-learn",
    "tf": "tensorflow",
    "hf": "hugging face",
    "langchain": "langchain",

    # Go
    "golang": "go",

    # Databases
    "postgres": "postgresql",
    "mongo": "mongodb",
    "elastic": "elasticsearch",
    "dynamo": "dynamodb",

    # Cloud
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",

    # DevOps
    "k8s": "kubernetes",
    "gh actions": "github actions",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",

    # Misc
    "oop": "object oriented",
    "ml": "machine learning",
    "dl": "deep learning",
    "cv": "computer vision",
    "genai": "generative ai",
}

# Canonical display names (lowercase key → proper display name)
DISPLAY_NAMES: dict = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "next.js": "Next.js",
    "nuxt.js": "Nuxt.js",
    "nest.js": "Nest.js",
    "react": "React",
    "vue": "Vue",
    "angular": "Angular",
    "python": "Python",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "linux": "Linux",
    "graphql": "GraphQL",
    "html": "HTML",
    "css": "CSS",
    "sass": "Sass",
    "tailwind": "Tailwind CSS",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "ci/cd": "CI/CD",
    "devops": "DevOps",
    "go": "Go",
    "rust": "Rust",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "rails": "Rails",
    "express": "Express",
    "spring": "Spring",
    "hugging face": "Hugging Face",
    "langchain": "LangChain",
    "openai": "OpenAI",
    "figma": "Figma",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "firebase": "Firebase",
    "supabase": "Supabase",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "agile": "Agile",
    "scrum": "Scrum",
    "tdd": "TDD",
    "microservices": "Microservices",
}


def normalize_skill_name(raw_name: str) -> str:
    """Normalize an extracted token to its canonical (lowercase) form."""
    cleaned = raw_name.lower().strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return ALIASES.get(cleaned, cleaned)


def _display(canonical: str) -> str:
    """Return the proper display-case name for a canonical skill."""
    return DISPLAY_NAMES.get(canonical, canonical.title() if len(canonical) > 3 else canonical.upper())


def extract_skills(text: str) -> List[Skill]:
    """
    Extract skills from text based on the expanded keyword taxonomy.
    Handles multi-word skills, aliases, and returns deduplicated Skill objects.
    """
    if not text or not text.strip():
        return []

    found_skills: List[Skill] = []
    text_lower = text.lower()
    # Normalize aliases in the input text as well
    for alias, canonical in ALIASES.items():
        text_lower = re.sub(rf"\b{re.escape(alias)}\b", canonical, text_lower)

    for category, category_skills in TAXONOMY.items():
        for skill in category_skills:
            # Build a regex that handles special chars like + # . /
            if re.search(r"[^\w\s]", skill):
                escaped = re.escape(skill)
                pattern = rf"(?<![a-z]){escaped}(?![a-z])"
            else:
                pattern = rf"\b{re.escape(skill)}\b"

            if re.search(pattern, text_lower):
                canonical = normalize_skill_name(skill)
                display = _display(canonical)
                found_skills.append(
                    Skill(name=display, category=category.replace("_", " ").title(), level="Present")
                )

    # Deduplicate by display name
    unique = {s.name: s for s in found_skills}
    return list(unique.values())


def normalize_skills(skills: List[Skill]) -> List[Skill]:
    """Normalize a list of Skill objects to canonical display names."""
    for sk in skills:
        canonical = normalize_skill_name(sk.name)
        sk.name = _display(canonical)
    return skills
