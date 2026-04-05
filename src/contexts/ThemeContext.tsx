import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "earthy" | "ocean" | "ember" | "rose" | "slate";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  contrast: number;
  setContrast: (value: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme, isDark: boolean, contrast: number) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("light", !isDark);
  root.style.setProperty("--section-contrast", String(contrast));
}

function getStoredTheme(): Theme {
  const raw = localStorage.getItem("theme");
  return raw === "earthy" || raw === "ocean" || raw === "ember" || raw === "rose" || raw === "slate" ? raw : "earthy";
}

function getStoredBoolean(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
}

function getStoredContrast(): number {
  const raw = localStorage.getItem("sectionContrast");
  const parsed = raw ? Number(raw) : 15;
  if (Number.isNaN(parsed)) return 15;
  return Math.max(0, Math.min(40, parsed));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [isDark, setIsDarkState] = useState<boolean>(() => getStoredBoolean("isDark", true));
  const [contrast, setContrastState] = useState<number>(() => getStoredContrast());

  useEffect(() => {
    document.documentElement.style.setProperty("color-scheme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    applyTheme(theme, isDark, contrast);
  }, [theme, isDark, contrast]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  const setIsDark = (d: boolean) => {
    setIsDarkState(d);
    localStorage.setItem("isDark", String(d));
  };

  const setContrast = (value: number) => {
    const clamped = Math.max(0, Math.min(40, value));
    setContrastState(clamped);
    localStorage.setItem("sectionContrast", String(clamped));
  };

  const value = useMemo(
    () => ({ theme, setTheme, isDark, setIsDark, contrast, setContrast }),
    [theme, isDark, contrast],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
