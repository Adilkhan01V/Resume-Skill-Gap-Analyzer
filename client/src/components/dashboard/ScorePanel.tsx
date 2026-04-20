import { Card } from "../common/Card";
import { SectionHeader } from "../common/SectionHeader";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

function getScoreStatus(score: number) {
  if (score >= 75) {
    return {
      message: "Strong match — your resume aligns well with the role",
      bgClass: "bg-emerald-500/15 border-emerald-500/40",
      textClass: "text-emerald-400",
      icon: "✅",
    };
  }
  if (score >= 50) {
    return {
      message: "Moderate match — some key areas need improvement",
      bgClass: "bg-yellow-500/15 border-yellow-500/40",
      textClass: "text-yellow-400",
      icon: "⚠️",
    };
  }
  return {
    message: "Needs work — significant gaps identified in your resume",
    bgClass: "bg-red-500/15 border-red-500/40",
    textClass: "text-red-400",
    icon: "🔴",
  };
}

export function ScorePanel({ score = 0 }: { score?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return controls.stop;
  }, [score, count]);

  const status = getScoreStatus(score);

  return (
    <Card>
      <div className="flex flex-col items-center py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-6">Match Score</p>
        
        <div className="relative flex items-center justify-center w-36 h-36 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-primary/10"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="276.46"
              initial={{ strokeDashoffset: 276.46 }}
              animate={{ strokeDashoffset: 276.46 - (276.46 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-primary"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{displayValue}</span>
            <span className="text-[10px] font-bold text-muted uppercase mt-0.5">/ 100</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.bgClass} ${status.textClass}`}
        >
          {status.message.split(' — ')[0]}
        </motion.div>
      </div>
    </Card>
  );
}
