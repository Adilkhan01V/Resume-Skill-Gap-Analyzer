import { useState, useEffect } from "react";
import { storage, ResumeHistoryItem } from "../services/storage";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/common/Card";

export function HistoryPage() {
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  const handleEdit = (item: ResumeHistoryItem) => {
    navigate("/dashboard", { 
      state: { 
        resumeData: item.resumeData, 
        scoreData: item.scoreData, 
        rawJd: item.jdText,
        roleTitle: item.roleTitle 
      } 
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this resume from history?")) {
      storage.deleteResume(id);
      setHistory(storage.getHistory());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-3">Resume <span className="text-primary">History</span></h1>
          <p className="text-muted">Access and manage your previously analyzed resumes.</p>
        </div>
        <div className="text-xs font-bold text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">
          {history.length} SAVED SESSIONS
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 bg-card/30 border-dashed border-2 border-border/50">
          <div className="text-6xl mb-6 opacity-20">📂</div>
          <h3 className="text-xl font-bold text-white mb-2">No History Found</h3>
          <p className="text-muted mb-8">You haven't analyzed any resumes yet.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all"
          >
            Start New Analysis
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  onClick={() => handleEdit(item)}
                  className="group relative h-full bg-card/40 hover:bg-card/60 border-border/50 hover:border-primary/50 transition-all cursor-pointer p-0 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        📄
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest">Match Score</div>
                          <div className="text-xl font-black text-white">{item.scoreData?.overall_score || 0}%</div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {item.resumeData?.name || "Untitled Resume"}
                    </h3>
                    <p className="text-xs text-muted mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.roleTitle || "General Analysis"}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(item.resumeData?.skills || []).slice(0, 3).map((skill: any, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium text-text/70 border border-white/10">
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                      {(item.resumeData?.skills || []).length > 3 && (
                        <span className="text-[10px] text-muted font-bold">+{item.resumeData.skills.length - 3} more</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all"
                        title="Delete from history"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
