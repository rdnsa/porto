import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale, Portfolio } from "../../shared/types";
import { LOCALES, MESSAGES, type MessageKey } from "./i18n";

export type Theme = "light" | "dark";

// Matches the browser chrome to the page canvas (Studio Mist in each theme).
const THEME_COLOR: Record<Theme, string> = { light: "#f5f5f7", dark: "#161617" };

function stored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice just won't survive a reload.
  }
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

interface Preferences {
  lang: Locale;
  theme: Theme;
  setLang: (lang: Locale) => void;
  toggleTheme: () => void;
  t: Translate;
}

const PreferencesContext = createContext<Preferences | null>(null);

/** Language and colour theme, remembered per browser. index.html applies both before first paint. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(() => stored("lang", LOCALES, "en"));
  const [theme, setTheme] = useState<Theme>(() => stored<Theme>("theme", ["light", "dark"], "light"));

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const setLang = useCallback((next: Locale) => {
    setLangState(next);
    store("lang", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      store("theme", next);
      return next;
    });
  }, []);

  const t = useCallback<Translate>(
    (key, vars) => {
      const text = MESSAGES[lang][key] ?? MESSAGES.en[key];
      return vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => String(vars[name] ?? match)) : text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, theme, setLang, toggleTheme, t }), [lang, theme, setLang, toggleTheme, t]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return value;
}

export const useT = () => usePreferences().t;

type Plain = Record<string, unknown>;
const isPlain = (value: unknown): value is Plain => typeof value === "object" && value !== null && !Array.isArray(value);

// Items that carry one of these keys are matched to their translation by it, not by position.
const MATCH_KEYS = ["slug", "src"];

function overlayArray(base: unknown[], patch: unknown[]): unknown[] {
  const key = MATCH_KEYS.find((k) => patch.some((item) => isPlain(item) && k in item));
  if (!key) return base.map((item, i) => (i < patch.length ? overlay(item, patch[i]) : item));
  const byKey = new Map(patch.filter(isPlain).map((item) => [item[key], item]));
  return base.map((item) => (isPlain(item) && byKey.has(item[key]) ? overlay(item, byKey.get(item[key])) : item));
}

/** Lays a partial translation over the English value; anything missing or mistyped keeps the English. */
function overlay(base: unknown, patch: unknown): unknown {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) return overlayArray(base, patch);
  if (isPlain(base) && isPlain(patch)) {
    const merged: Plain = { ...base };
    for (const [key, value] of Object.entries(patch)) merged[key] = overlay(base[key], value);
    return merged;
  }
  return typeof patch === typeof base || base === null ? patch : base;
}

/** The portfolio in the given language (English is the source; other locales are overlays). */
export function localize(portfolio: Portfolio, lang: Locale): Portfolio {
  const translation = lang === "en" ? undefined : portfolio.translations?.[lang];
  return translation ? (overlay(portfolio, translation) as Portfolio) : portfolio;
}
