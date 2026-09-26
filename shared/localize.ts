import type { Locale, Portfolio } from "./types";

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
