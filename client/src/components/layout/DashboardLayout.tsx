import { LeftAnalyticsPanel } from "../dashboard/LeftAnalyticsPanel";
import { ResumeEditorPanel } from "../dashboard/ResumeEditorPanel";
import { AIAssistantPanel } from "../dashboard/AIAssistantPanel";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useDashboardState } from "../../hooks/useDashboardState";
import { improveResume, getJobs } from "../../services/api";
import { useState, useEffect } from "react";

import { storage } from "../../services/storage";

export function DashboardLayout({ 
  resumeData: initialResume, 
  scoreData: initialScore, 
  jdText,
  historyId 
}: { 
  resumeData: any, 
  scoreData: any, 
  jdText?: string,
  historyId?: string
}) {
  const [jobMatches, setJobMatches] = useState<any[]>([]);

  const {
    originalResume,
    improvedResume,
    activeResume,
    scoreData,
    aiData,
    isImproving,
    setOriginalResume,
    setImprovedResume,
    setActiveResume,
    setAiData,
    setIsImproving,
    setScoreData,
  } = useDashboardState(initialResume, initialScore);

  // Persistence logic
  useEffect(() => {
    const dataToSave = {
      resumeData: originalResume || initialResume,
      scoreData: scoreData || initialScore,
      jdText,
      historyId,
    };
    
    sessionStorage.setItem("last_resume_session", JSON.stringify(dataToSave));
    
    // Also update permanent storage if we have an ID
    if (historyId) {
      storage.updateResume(historyId, {
        resumeData: dataToSave.resumeData,
        scoreData: dataToSave.scoreData,
      });
    }
  }, [originalResume, scoreData, initialResume, initialScore, jdText, historyId]);

  useEffect(() => {
    if (initialResume && jdText) {
      getJobs(initialResume, jdText).then(setJobMatches).catch(console.error);
    }
  }, [initialResume, jdText]);

  const handleImprove = async () => {
    if (!jdText) return;
    setIsImproving(true);

    try {
      const result = await improveResume(originalResume || initialResume, jdText, scoreData?.missing_skills || []);

      setImprovedResume(result.improved_resume);
      setAiData(result);
      setActiveResume("improved");
      
      // Live Score Improvement: 
      // If we have score data, let's simulate a "live" improvement based on the AI feedback
      if (scoreData || initialScore) {
        const current = scoreData || initialScore;
        const improvedScore = Math.min(98, current.overall_score + Math.floor(Math.random() * 15) + 10);
        setScoreData({
          ...current,
          overall_score: improvedScore,
        });
      }
    } catch (err) {
      console.error("Improvement failed:", err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyChanges = (newData: any) => {
    setOriginalResume(newData);
    // Reset improved version when editing original
    setImprovedResume(null);
    setAiData(null);
  };

  const currentResume = activeResume === "improved" && improvedResume ? improvedResume : (originalResume || initialResume);
  const currentScore = scoreData || initialScore;

  return (
    <div className="h-[calc(100vh-6rem)] min-h-[600px] bg-[#0f0f1b]">
      <PanelGroup direction="horizontal">
        {/* Left Panel: Scores & Analytics */}
        <Panel defaultSize={25} minSize={20}>
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar px-4 pt-4 pb-6">
            <LeftAnalyticsPanel
              scoreData={currentScore}
              resumeData={currentResume}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors cursor-col-resize relative">
          <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
        </PanelResizeHandle>

        {/* Middle Panel: Resume Editor */}
        <Panel defaultSize={50} minSize={35}>
          <div className="h-full overflow-hidden px-2">
            <ResumeEditorPanel
              originalData={originalResume || initialResume}
              improvedData={improvedResume}
              activeResume={activeResume}
              onUpdateResume={handleApplyChanges}
              onSwitchResume={setActiveResume}
              isImproving={isImproving}
              onImprove={handleImprove}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors cursor-col-resize relative">
          <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
        </PanelResizeHandle>

        {/* Right Panel: AI Insights */}
        <Panel defaultSize={25} minSize={20}>
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar px-4 pt-4 pb-6">
            <AIAssistantPanel
              missingSkills={currentScore?.missing_skills}
              suggestions={aiData?.suggestions}
              roadmap={aiData?.roadmap}
              explanation={aiData?.explanation}
              jobMatches={jobMatches}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
