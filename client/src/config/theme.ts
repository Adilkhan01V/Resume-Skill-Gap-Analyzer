export type ThemeMode = "light" | "dark";

export const THEME_CONFIG = {
  defaultMode: (import.meta.env.VITE_DEFAULT_THEME as ThemeMode) ?? "dark",
  appThemes: {
    dark: {
      background: "#0F0F1B",
      card: "#1A1A2E",
      primary: "#7C3AED",
      secondary: "#3B82F6",
      accent: "#22D3EE",
      text: "#E5E7EB"
    },
    light: {
      background: "#F8FAFC",
      card: "#FFFFFF",
      primary: "#6D28D9",
      secondary: "#2563EB",
      accent: "#06B6D4",
      text: "#111827"
    }
  }
};
