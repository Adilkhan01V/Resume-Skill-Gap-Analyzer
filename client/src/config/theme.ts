export type ThemeMode = "light" | "dark";

export const THEME_CONFIG = {
  defaultMode: "dark" as ThemeMode,
  appThemes: {
    dark: {
      background: "#0F0F1B",
      card: "#1A1A2E",
      primary: "#7C3AED",
      secondary: "#3B82F6",
      accent: "#22D3EE",
      text: "#E5E7EB"
    }
  }
};
