import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Step {
  id: number;
  label: string;
  status: "pending" | "loading" | "completed";
}

export function AnalysisLoadingOverlay({ isVisible, currentStepIndex }: { isVisible: boolean, currentStepIndex: number }) {
  const steps: string[] = [
    "Reading resume structure...",
    "Extracting technical skills...",
    "Analyzing job requirements...",
    "Calculating match score...",
    "Generating AI recommendations...",
    "Preparing your dashboard..."
  ];

  const [displaySteps, setDisplaySteps] = useState<Step[]>(
    steps.map((s, i) => ({ id: i, label: s, status: "pending" }))
  );

  useEffect(() => {
    setDisplaySteps(prev => prev.map((step, i) => ({
      ...step,
      status: i < currentStepIndex ? "completed" : i === currentStepIndex ? "loading" : "pending"
    })));
  }, [currentStepIndex]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-md p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mx-auto mb-8 h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary"
            />
            
            <h2 className="mb-6 text-2xl font-bold text-text">AI Analysis in Progress</h2>
            
            <div className="space-y-4 text-left">
              {displaySteps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    {step.status === "completed" ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    ) : step.status === "loading" ? (
                      <div className="h-3 w-3 animate-ping rounded-full bg-primary" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    step.status === "completed" ? "text-text" : 
                    step.status === "loading" ? "text-primary" : "text-muted"
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-xs text-muted">
              Our AI is currently mapping your skills to the target role. 
              This usually takes a few seconds.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
