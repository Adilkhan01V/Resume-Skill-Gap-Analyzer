import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from "react";
import { Card } from "../common/Card";
import { StructuredResumeEditor } from "./StructuredResumeEditor";
import { motion, AnimatePresence } from "framer-motion";
import { exportResume } from "../../services/api";

interface ResumeEditorPanelProps {
  originalData: any;
  improvedData: any;
  activeResume: "original" | "improved";
  onUpdateResume: (newData: any) => void;
  onSwitchResume: (mode: "original" | "improved") => void;
  isImproving?: boolean;
  onImprove?: () => void;
}

export function ResumeEditorPanel({
  originalData,
  improvedData,
  activeResume,
  onUpdateResume,
  onSwitchResume,
  isImproving = false,
  onImprove,
}: ResumeEditorPanelProps) {
  const [viewMode, setViewMode] = useState<"edit" | "compare">("edit");
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "docx") => {
    setIsExporting(true);
    try {
      const dataToExport = activeResume === "improved" && improvedData ? improvedData : originalData;
      await exportResume(dataToExport, format);
    } catch (err) {
      console.error("Export failed:", err);
      alert(err instanceof Error ? err.message : "Failed to export resume. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const moveSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    moveSlider(event.clientX);
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging || !event.touches.length) return;
    moveSlider(event.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleWindowMouseMove = (event: globalThis.MouseEvent) => moveSlider(event.clientX);
    const handleWindowTouchMove = (event: globalThis.TouchEvent) => {
      if (!event.touches.length) return;
      moveSlider(event.touches[0].clientX);
    };
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("touchmove", handleWindowTouchMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const currentData = activeResume === "improved" && improvedData ? improvedData : originalData;

  return (
    <Card className="flex flex-col relative h-full overflow-hidden border-border/50 shadow-2xl bg-card/80 backdrop-blur-md p-0 md:p-0">
      {/* ── Compact Top Bar ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-border/40 bg-card/90 backdrop-blur-md z-20 min-h-[42px]">
        {/* Left: View toggles */}
        <div className="flex bg-bg/40 p-0.5 rounded-lg border border-border/50 gap-0.5">
          <button
            onClick={() => { onSwitchResume("original"); setViewMode("edit"); }}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              activeResume === "original" && viewMode === "edit"
                ? "bg-primary text-white shadow"
                : "text-muted hover:text-text"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => { onSwitchResume("improved"); setViewMode("edit"); }}
            disabled={!improvedData}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              activeResume === "improved" && viewMode === "edit"
                ? "bg-secondary text-white shadow"
                : "text-muted hover:text-text disabled:opacity-40"
            }`}
          >
            Improved
          </button>
        </div>

        {/* Center: Improve with AI button */}
        <button
          onClick={onImprove}
          disabled={isImproving || !onImprove}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-primary border border-primary/30 transition-all disabled:opacity-40"
        >
          {isImproving ? (
            <>
              <div className="w-3 h-3 border-[1.5px] border-primary/30 border-t-primary rounded-full animate-spin"></div>
              Improving…
            </>
          ) : (
            <>✨ Improve with AI</>
          )}
        </button>

        {/* Right: Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("docx")}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 transition-all disabled:opacity-40"
            title="Export DOCX"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            DOCX
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all disabled:opacity-40"
            title="Export PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {isExporting ? "..." : "PDF"}
          </button>
        </div>
      </div>

      {/* ── Content Area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "edit" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <StructuredResumeEditor data={currentData} onChange={onUpdateResume} readOnly={false} />
            </motion.div>
          ) : (
            <motion.div
              key="compare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full relative"
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              <div className="absolute inset-0 flex">
                <div className="overflow-hidden h-full" style={{ width: `${sliderPosition}%` }}>
                  <StructuredResumeEditor data={originalData} onChange={() => {}} readOnly={true} />
                </div>
                <div
                  className="w-4 flex items-center justify-center cursor-col-resize relative z-10 flex-shrink-0"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                >
                  <div className="h-12 w-1 rounded-full bg-primary/70 shadow-glow" />
                </div>
                <div className="overflow-hidden h-full flex-1">
                  <StructuredResumeEditor data={improvedData || originalData} onChange={() => {}} readOnly={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
