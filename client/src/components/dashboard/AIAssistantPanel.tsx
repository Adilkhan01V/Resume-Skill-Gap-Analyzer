import { useState } from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { SectionHeader } from "../common/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";

interface AIAssistantPanelProps {
  missingSkills?: string[];
  suggestions?: string[];
  roadmap?: any[];
  explanation?: string;
  jobMatches?: any[];
}

export function AIAssistantPanel({
  missingSkills,
  suggestions: aiSuggestions,
  roadmap: aiRoadmap,
  explanation: aiExplanation,
  jobMatches = []
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "suggestions" | "roadmap">("jobs");

  const tabs = [
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "suggestions", label: "Suggestions", icon: "💡" },
    { id: "roadmap", label: "Roadmap", icon: "🗺️" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "jobs":
        return (
          <div className="space-y-4">
            {jobMatches.length > 0 ? (
              jobMatches.map((job, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-card/40 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {/* Circular Match Score */}
                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-primary/10"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="263.89"
                            initial={{ strokeDashoffset: 263.89 }}
                            animate={{ strokeDashoffset: 263.89 - (263.89 * job.matchPercentage) / 100 }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="text-emerald-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-white">{job.matchPercentage}%</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider">{job.level}</span>
                          <span className="text-[10px] text-muted font-medium">{job.skillsMatched.length} skills matched</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-text/80 mb-2">
                      {job.matchPercentage >= 75 ? "Strong match" : "Moderate match"} — {job.skillsMatched.length}/{job.skillsMatched.length + (job.missingSkills?.length || 0)} core skills aligned
                    </p>
                    
                    {/* Matched Skills */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest">Matched</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.skillsMatched.map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <p className="text-[9px] font-black text-muted uppercase tracking-widest">Missing</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missingSkills.map((skill: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-medium border border-red-500/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border/30">
                    <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                      📍 {job.location || "Remote / On-site"}
                    </span>
                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                      View Details →
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted">
                <div className="text-5xl mb-4 opacity-20">💼</div>
                <p className="text-sm font-medium">No job matches found</p>
                <p className="text-xs mt-1 opacity-60">Complete your profile to see tailored opportunities</p>
              </div>
            )}
          </div>
        );

      case "suggestions":
        const suggestions = (aiSuggestions && aiSuggestions.length > 0) ? aiSuggestions : (missingSkills && missingSkills.length > 0
          ? missingSkills.map(s => `Skill Gap: Consider adding experience with '${s}' to strengthen your profile.`)
          : ["General: Your resume looks well-rounded! Focus on quantifying your achievements."]);

        return (
          <div className="space-y-6">
            {aiExplanation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-5 rounded-2xl bg-primary/5 border border-primary/20 overflow-hidden group"
              >
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   AI Analysis Executive Summary
                </h4>
                <p className="text-xs text-text/80 leading-relaxed font-medium italic">
                  "{aiExplanation}"
                </p>
              </motion.div>
            )}

            <div className="grid gap-4">
              <div className="flex items-center justify-between mb-1 px-1">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="text-primary">✨</span> Optimization Roadmap
                </h3>
                <span className="text-[10px] font-bold text-muted bg-white/5 px-2 py-0.5 rounded-full">
                  {suggestions.length} Improvements
                </span>
              </div>
              
              {suggestions.map((item, idx) => {
                // Parse "Category: Detail"
                const parts = item.split(':');
                const hasCategory = parts.length > 1;
                const category = hasCategory ? parts[0].trim() : "Improvement";
                const content = hasCategory ? parts.slice(1).join(':').trim() : item;
                
                // Determine icon and color based on category
                const getCategoryStyle = (cat: string) => {
                  const c = cat.toLowerCase();
                  if (c.includes('impact') || c.includes('achieve')) return { icon: '📈', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
                  if (c.includes('skill') || c.includes('tech')) return { icon: '🛠️', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
                  if (c.includes('ats') || c.includes('seo')) return { icon: '🔍', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
                  if (c.includes('format')) return { icon: '🎨', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
                  if (c.includes('action') || c.includes('verb')) return { icon: '⚡', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
                  return { icon: '💡', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
                };

                const style = getCategoryStyle(category);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                    className={`relative p-4 rounded-2xl border ${style.border} bg-card/30 hover:bg-card/50 transition-all hover:scale-[1.02] group shadow-sm`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 shrink-0 rounded-xl ${style.bg} flex items-center justify-center text-lg shadow-inner`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${style.color}`}>
                            {category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-[9px] font-bold text-muted">High Priority</span>
                        </div>
                        <p className="text-sm text-text/90 leading-relaxed font-medium">
                          {content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case "roadmap":
        return (
          <div className="space-y-4">
            {aiRoadmap && aiRoadmap.length > 0 ? (
              aiRoadmap.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg bg-gradient-to-r from-secondary/10 to-accent/10 p-4 border border-secondary/20"
                >
                  <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>📅</span> {item.week}
                  </p>
                  <p className="text-sm font-medium mb-3 text-primary">{item.focus}</p>
                  <ul className="space-y-2">
                    {item.steps.map((step: string, sIdx: number) => (
                      <li key={sIdx} className="text-xs text-muted flex items-start gap-2">
                        <span className="text-secondary mt-1">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">
                <div className="text-4xl mb-2">🗺️</div>
                <p>No learning roadmap available yet.</p>
                <p className="text-xs mt-1">Use AI improvement to generate a personalized learning plan.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Tab Navigation */}
      <div className="flex flex-wrap gap-6 px-1 mb-6 border-b border-border/30">
        {tabs.map((tab) => {
          const counts: Record<string, number> = {
            suggestions: (aiSuggestions?.length || (missingSkills?.length || 0)),
            roadmap: (aiRoadmap?.length || 0),
            jobs: (jobMatches?.length || 0)
          };
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold transition-all relative group/tab ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-muted hover:text-text"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white" 
                    : "bg-bg/50 text-muted group-hover/tab:text-text"
                }`}>
                  {count}
                </span>
              </div>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgb(var(--color-primary))]" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
