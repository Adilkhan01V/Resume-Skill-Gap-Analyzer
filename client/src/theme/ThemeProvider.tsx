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
  const [mode, setMode] = useState<ThemeMode>(THEME_CONFIG.defaultMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme: () => setMode((prev) => (prev === "dark" ? "light" : "dark"))
    }),
    [mode]
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
