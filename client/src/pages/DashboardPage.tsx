import { DashboardLayout } from "../components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function DashboardPage() {
  const location = useLocation();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const state = location.state as {
    resumeData?: any;
    scoreData?: any;
    rawJd?: string;
    roleTitle?: string;
  } | null;

  useEffect(() => {
    if (!state?.resumeData) {
      const saved = sessionStorage.getItem("last_resume_session");
      if (saved) {
        try {
          setSessionData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load session", e);
        }
      }
    } else {
      setSessionData(state);
    }
    setIsLoaded(true);
  }, [state]);

  if (!isLoaded) return null;

  if (!sessionData || !sessionData.resumeData || !sessionData.scoreData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-2xl font-bold text-text">No Analysis Data Found</h2>
        <p className="text-muted max-w-md">
          It looks like you haven't processed a resume yet, or the page was refreshed. Please return to the home page and trigger a new analysis.
        </p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 mt-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg transition-all border-none cursor-pointer">
          Return to Upload
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <DashboardLayout 
        resumeData={sessionData.resumeData} 
        scoreData={sessionData.scoreData} 
        improvedResume={sessionData.improvedResume}
        aiData={sessionData.aiData}
        activeResume={sessionData.activeResume}
        jdText={sessionData.rawJd || sessionData.jdText} 
        historyId={sessionData.historyId}
      />
    </motion.div>
  );
}
