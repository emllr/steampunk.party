"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type Props = {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

const ThemeContext = React.createContext<{
  theme: Theme;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
} | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
}: Props) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  // initialize from localStorage or system
  React.useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme)) || null;
    const initial = stored ?? defaultTheme;
    setThemeState(initial);
  }, [defaultTheme]);

  // watch system theme
  React.useEffect(() => {
    if (!enableSystem) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setResolvedTheme(mql.matches ? "dark" : "light");
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [enableSystem]);

  // apply theme to document
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const current = theme === "system" && enableSystem ? getSystemTheme() : (theme as "light" | "dark");
    setResolvedTheme(current);

    const nextApply = () => {
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(current);
      } else {
        root.setAttribute(attribute, current);
      }
    };

    if (disableTransitionOnChange) {
      const css = document.createElement("style");
      css.appendChild(document.createTextNode("*{transition:none!important} body{transition:none!important}"));
      document.head.appendChild(css);
      nextApply();
      void window.getComputedStyle(css).opacity;
      document.head.removeChild(css);
    } else {
      nextApply();
    }

    if (theme !== "system") localStorage.setItem("theme", theme);
    else localStorage.removeItem("theme");
    root.style.colorScheme = current;
  }, [theme, attribute, disableTransitionOnChange, enableSystem]);

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = React.useCallback(() => {
    // Toggle only between light and dark; when on system, use resolvedTheme as current
    const current = theme === "system" && enableSystem ? getSystemTheme() : theme;
    const next = (current === "dark" ? "light" : "dark") as Theme;
    setThemeState(next);
    localStorage.setItem("theme", next);
  }, [theme, enableSystem]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
