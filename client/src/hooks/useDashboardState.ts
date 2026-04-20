import { useState, useCallback, useEffect } from 'react';
import { getScore } from '../services/api';

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string;
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    year?: string;
  }>;
}

export interface ScoreData {
  overall_score: number;
  section_scores: {
    skill?: number;
    evidence?: number;
    ats?: number;
    semantic?: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  confidence_breakdown: Array<{
    skill: string;
    type: 'VERIFIED' | 'DECLARED';
  }>;
}

export interface AIDashboardState {
  originalResume: ResumeData | null;
  improvedResume: ResumeData | null;
  activeResume: 'original' | 'improved';
  scoreData: ScoreData | null;
  aiData: {
    suggestions?: string[];
    roadmap?: any[];
    explanation?: string;
  } | null;
  isImproving: boolean;
  isScoring: boolean;
}

export function useDashboardState(initialResume?: ResumeData, initialScore?: ScoreData) {
  const [state, setState] = useState<AIDashboardState>({
    originalResume: initialResume || null,
    improvedResume: null,
    activeResume: 'original',
    scoreData: initialScore || null,
    aiData: null,
    isImproving: false,
    isScoring: false,
  });

  const setOriginalResume = useCallback((resume: ResumeData) => {
    setState(prev => ({ ...prev, originalResume: resume }));
  }, []);

  const setImprovedResume = useCallback((resume: ResumeData | null) => {
    setState(prev => ({
      ...prev,
      improvedResume: resume,
      activeResume: resume ? 'improved' : prev.activeResume,
    }));
  }, []);

  const setActiveResume = useCallback((active: 'original' | 'improved') => {
    setState(prev => ({ ...prev, activeResume: active }));
  }, []);

  const setScoreData = useCallback((score: ScoreData) => {
    setState(prev => ({ ...prev, scoreData: score }));
  }, []);

  const setAiData = useCallback((aiData: any) => {
    setState(prev => ({ ...prev, aiData }));
  }, []);

  const setIsImproving = useCallback((improving: boolean) => {
    setState(prev => ({ ...prev, isImproving: improving }));
  }, []);

  const setIsScoring = useCallback((scoring: boolean) => {
    setState(prev => ({ ...prev, isScoring: scoring }));
  }, []);

  // Debounced scoring function
  const updateScore = useCallback(async (resumeData: ResumeData, jdText: string) => {
    if (!jdText) return;

    setIsScoring(true);
    try {
      const scoreResult = await getScore(resumeData, jdText);
      setScoreData(scoreResult);
    } catch (error) {
      console.error('Failed to update score:', error);
    } finally {
      setIsScoring(false);
    }
  }, [setIsScoring, setScoreData]);

  // Debounce implementation for real-time updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.originalResume && state.scoreData?.missing_skills) {
        // Could trigger lightweight scoring here if needed
      }
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [state.originalResume]);

  return {
    ...state,
    setOriginalResume,
    setImprovedResume,
    setActiveResume,
    setScoreData,
    setAiData,
    setIsImproving,
    setIsScoring,
    updateScore,
  };
}
