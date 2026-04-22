import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-2 md:px-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-sm font-semibold text-primary">
            RS
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">Resume Analyzer</p>
            <p className="text-[10px] text-muted uppercase tracking-tighter">Career Assistant</p>
          </div>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {[
            { href: "/", label: "Home" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/history", label: "History" }
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                pathname === item.href
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-card hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
