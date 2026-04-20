import { diff_match_patch } from 'diff-match-patch';

export function generateResumeHtml(resumeData: any, highlightDiffs: boolean = false, originalData?: any) {
  if (!resumeData) return "";

  const dmp = new diff_match_patch();

  const wrapDiff = (text: string, originalText: string) => {
    if (!highlightDiffs || !originalText || text === originalText) return text;
    
    const diffs = dmp.diff_main(originalText, text);
    dmp.diff_cleanupSemantic(diffs);
    
    return diffs.map(([op, data]) => {
      if (op === 0) return data; // No change
      if (op === 1) return `<mark class="diff-added">${data}</mark>`; // Added
      if (op === -1) return `<span class="diff-removed">${data}</span>`; // Removed
      return data;
    }).join('');
  };

  const name = wrapDiff(resumeData.name || "YOUR NAME", originalData?.name);
  const email = wrapDiff(resumeData.email || "your.email@example.com", originalData?.email);
  
  const skillsList = resumeData.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(" • ") || "";
  const originalSkillsList = originalData?.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(" • ") || "";
  const skills = wrapDiff(skillsList, originalSkillsList);

  const experienceHtml = (resumeData.experience || []).map((exp: string, idx: number) => {
    const originalExp = originalData?.experience?.[idx] || "";
    return `<li>${wrapDiff(exp, originalExp)}</li>`;
  }).join('');

  const projectsHtml = (resumeData.projects || []).map((proj: string, idx: number) => {
    const originalProj = originalData?.projects?.[idx] || "";
    return `<li>${wrapDiff(proj, originalProj)}</li>`;
  }).join('');

  const educationHtml = (resumeData.education || []).map((edu: string, idx: number) => {
    const originalEdu = originalData?.education?.[idx] || "";
    return `<li>${wrapDiff(edu, originalEdu)}</li>`;
  }).join('');

  return `
    <h1>${name}</h1>
    <p class="contact-info">${email} • (000) 000-0000 • LinkedIn / GitHub</p>

    <h2>Technical Skills</h2>
    <p>${skills}</p>

    <h2>Professional Experience</h2>
    <ul>
      ${experienceHtml || '<li>Software Engineer @ Tech Corp</li>'}
    </ul>

    <h2>Projects</h2>
    <ul>
      ${projectsHtml || '<li>Built an AI Resume Analyzer using React and FastAPI.</li>'}
    </ul>

    <h2>Education</h2>
    <ul>
      ${educationHtml || '<li>B.S. in Computer Science</li>'}
    </ul>
  `;
}
