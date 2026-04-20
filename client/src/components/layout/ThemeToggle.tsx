import { useTheme } from "../../theme/ThemeProvider";

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-text transition hover:border-primary/60 hover:text-primary"
      aria-label="Toggle theme"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
