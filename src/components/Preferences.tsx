import { Moon, Sun } from "lucide-react";
import type { CSSProperties } from "react";
import { LOCALES } from "../lib/i18n";
import { usePreferences } from "../lib/prefs";

/** EN · ID switch and a light/dark toggle, shown in the hero header and the floating nav. */
export function Preferences({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const { lang, setLang, theme, toggleTheme, t } = usePreferences();

  return (
    <div className={`flex items-center gap-2 ${className}`} style={style}>
      <div role="group" aria-label={t("prefs.language")} className="flex items-center text-control">
        {LOCALES.map((locale, i) => (
          <span key={locale} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="px-1 text-steel">
                ·
              </span>
            )}
            <button
              type="button"
              lang={locale}
              onClick={() => setLang(locale)}
              aria-pressed={lang === locale}
              className={`rounded px-0.5 uppercase tracking-wide transition-colors duration-300 ${lang === locale ? "font-semibold text-ink" : "text-slate hover:text-ink"}`}
            >
              {locale}
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t(theme === "dark" ? "prefs.toLight" : "prefs.toDark")}
        className="grid size-8 place-items-center rounded-full text-ink transition-[background-color,transform] duration-300 hover:bg-ink/10 active:scale-90"
      >
        {theme === "dark" ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
      </button>
    </div>
  );
}
