import { Badge } from "../common/Badge";
import { Card } from "../common/Card";
import { SectionHeader } from "../common/SectionHeader";
import { ScorePanel } from "./ScorePanel";
import { motion } from 'framer-motion';

export function LeftAnalyticsPanel({ scoreData, resumeData }: { scoreData?: any, resumeData?: any }) {
  if (!scoreData) return null;

  const sectionScores = scoreData.section_scores || {};
  const confidenceBreakdown = scoreData.confidence_breakdown || [];
  const matchedSkills = scoreData.matched_skills || [];
  const missingSkills = scoreData.missing_skills || [];
  const extractedSkills = ((resumeData?.skills || []) as any[])
    .map((skill: any) => typeof skill === 'string' ? skill : skill?.name)
    .filter((skill: any): skill is string => typeof skill === 'string');

  const verifiedSkills = confidenceBreakdown
    .filter((item: any) => item.type === "VERIFIED")
    .map((item: any) => item.skill);
  const declaredSkills = confidenceBreakdown
    .filter((item: any) => item.type === "DECLARED")
    .map((item: any) => item.skill);

  const fallbackDeclaredSkills = extractedSkills.filter(skill => !verifiedSkills.includes(skill));

  return (
    <motion.div
      className="space-y-4 pb-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ScorePanel score={scoreData.overall_score} />

      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
        <SectionHeader title="Score Breakdown" subtitle="How your resume performs across core match areas" />
        <div className="space-y-4 mt-4">
          {[
            { label: "Skill Match", value: sectionScores.skill, color: "bg-primary" },
            { label: "Evidence", value: sectionScores.evidence, color: "bg-emerald-500" },
            { label: "ATS Compatibility", value: sectionScores.ats, color: "bg-cyan-500" },
            { label: "Semantic Match", value: sectionScores.semantic, color: "bg-orange-500" }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-text/80">
                <span>{item.label}</span>
                <span>{item.value ?? 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value ?? 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                  className={`${item.color} h-full rounded-full shadow-sm`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>


      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-primary/5">
          <SectionHeader title="Matched Skills" subtitle="Keywords already aligned with the job" />
          <div className="flex flex-wrap gap-2 mt-3">
            {matchedSkills.length ? (
              matchedSkills.map((skill: string, idx: number) => (
                <motion.div
                  key={`${skill}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Badge key={`${skill}-${idx}`} label={skill} tone="default" />
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted">No matched skills identified yet.</p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <SectionHeader title="Missing Skills" subtitle="Key gaps to address" />
          <div className="flex flex-wrap gap-2 mt-3">
            {missingSkills.length ? (
              missingSkills.map((skill: string, idx: number) => (
                <motion.div
                  key={`${skill}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Badge key={`${skill}-${idx}`} label={skill} tone="accent" />
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted">No major gaps found.</p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-secondary/10 bg-gradient-to-br from-secondary/5 to-accent/5">
          <SectionHeader title="Your Skills" subtitle="Detected from your uploaded resume" />

          <div className="grid gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-2 font-semibold">Verified in Projects</p>
              <div className="flex flex-wrap gap-2">
                {verifiedSkills.length ? (
                  verifiedSkills.map((skill: string, idx: number) => (
                    <motion.div
                      key={`verified-${skill}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Badge key={`verified-${skill}-${idx}`} label={skill} tone="default" />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted italic">No verified skills detected</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 mb-2 font-semibold">Declared in Resume</p>
              <div className="flex flex-wrap gap-2">
                {(declaredSkills.length ? declaredSkills : fallbackDeclaredSkills).length ? (
                  (declaredSkills.length ? declaredSkills : fallbackDeclaredSkills).map((skill: string, idx: number) => (
                    <motion.div
                      key={`declared-${skill}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Badge key={`declared-${skill}-${idx}`} label={skill} tone="accent" />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted italic">No declared skills detected</p>
                )}
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
