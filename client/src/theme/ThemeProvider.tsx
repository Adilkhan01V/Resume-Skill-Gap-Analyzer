import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { THEME_CONFIG, ThemeMode } from "../config/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Application is now locked to dark mode
  const [mode] = useState<ThemeMode>("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const value = useMemo(
    () => ({
      mode: "dark" as ThemeMode,
      toggleTheme: () => {
        console.log("Theme toggling is disabled. System is locked to Dark Mode.");
      }
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
