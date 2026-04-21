const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://resume-skill-gap-analyzer-1.onrender.com/api/v1";

export const analyzeResume = async (file: File, jobDescription: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Analyze Error details:", errorData);
    throw new Error(errorData.detail || errorData.message || `Failed to analyze resume (${res.status})`);
  }
  return res.json();
};

export const getScore = async (resumeData: any, jobDescription: string) => {
  const res = await fetch(`${API_BASE_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // FastAPI Body() reads from top-level JSON keys when embed=False
    body: JSON.stringify({
      resume_data: resumeData,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Score Error details:", errorData);
    throw new Error(errorData.detail || errorData.message || "Failed to calculate score");
  }
  return res.json();
};

export const getJobs = async (resumeData: any, jobDescription: string) => {
  const res = await fetch(`${API_BASE_URL}/jobs/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // matches the new POST / handler on the jobs router
    body: JSON.stringify({
      resume_data: resumeData,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    console.error("Jobs fetch failed:", res.status, await res.text().catch(() => ""));
    throw new Error("Failed to get job recommendations");
  }
  const data = await res.json();
  // Backend returns { matches: [...] }
  return (data.matches || data.jobs || []).map((m: any) => ({
    title: m.title ?? m.role ?? "Unknown",
    company: m.company ?? "",
    matchPercentage: m.match_percentage ?? m.matchPercentage ?? 0,
    level: m.level ?? deriveLevel(m.match_percentage ?? 0),
    skillsMatched: m.matched_skills ?? m.skillsMatched ?? [],
    missingSkills: m.missing_skills ?? [],
    description: m.reason ?? m.description ?? "",
    location: m.location ?? "Remote / On-site",
  }));
};

function deriveLevel(matchPct: number): string {
  if (matchPct >= 80) return "Senior";
  if (matchPct >= 55) return "Mid-level";
  return "Junior";
}

export const improveResume = async (resumeData: any, jobDescription: string, missingSkills: string[] = []) => {
  const res = await fetch(`${API_BASE_URL}/improve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume_data: resumeData,
      job_description: jobDescription,
      missing_skills: missingSkills,
    }),
  });

  if (!res.ok) throw new Error("Failed to improve resume");
  return res.json();
};

export const getJobMatches = async (skills: string[]) => {
  const res = await fetch(`${API_BASE_URL}/jobs/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skills),
  });

  if (!res.ok) throw new Error("Failed to fetch job matches");
  return res.json();
};

export const exportResume = async (resumeData: any, format: "pdf" | "docx" = "pdf") => {
  const res = await fetch(`${API_BASE_URL}/export/?format=${format}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resumeData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to export resume");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};