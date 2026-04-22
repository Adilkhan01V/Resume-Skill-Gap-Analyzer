
const STORAGE_KEY = "resume_history";

export interface ResumeHistoryItem {
  id: string;
  timestamp: number;
  resumeData: any;
  scoreData: any;
  improvedResume?: any;
  aiData?: any;
  activeResume?: 'original' | 'improved';
  jdText?: string;
  roleTitle?: string;
}

export const storage = {
  saveResume: (item: Omit<ResumeHistoryItem, "id" | "timestamp">) => {
    const history = storage.getHistory();
    const newItem: ResumeHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    // Keep only last 20 resumes to avoid filling up localStorage
    const newHistory = [newItem, ...history].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    return newItem;
  },

  getHistory: (): ResumeHistoryItem[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse resume history", e);
      return [];
    }
  },

  getLatest: (): ResumeHistoryItem | null => {
    const history = storage.getHistory();
    return history.length > 0 ? history[0] : null;
  },

  deleteResume: (id: string) => {
    const history = storage.getHistory();
    const newHistory = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  },

  updateResume: (id: string, updates: Partial<ResumeHistoryItem>) => {
    const history = storage.getHistory();
    const newHistory = history.map((item) => 
      item.id === id ? { ...item, ...updates, timestamp: Date.now() } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }
};
