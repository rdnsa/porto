import { useEffect, useRef, useState } from "react";
import { NAV } from "../lib/nav";
import { useT } from "../lib/prefs";
import { useScrollVar } from "../lib/scroll";
import { Preferences } from "./Preferences";
import { BluePill } from "./ui";

const pageProgress = () =>
  window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

/**
 * DESIGN.md "Product Local Navigation", as a floating frosted capsule: it drops in once the hero's
 * own navigation has scrolled off screen and tucks away again when that navigation comes back.
 */
export function LocalNav({ name, onMenu }: { name: string; onMenu: () => void }) {
  const t = useT();
  const bar = useRef<HTMLDivElement>(null);
  useScrollVar(bar, pageProgress);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const heroNav = document.getElementById("hero-nav");
    if (!heroNav) return;
    // The 24px top margin keeps the hero's menu button fully gone before the capsule arrives.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "24px 0px 0px 0px" },
    );
    observer.observe(heroNav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = NAV.map((item) => document.querySelector(item.href)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      className={`pointer-events-none fixed inset-x-0 top-3 z-[35] flex justify-center px-3 transition-[translate,scale,opacity] duration-700 ease-out-quint sm:top-4 ${visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-[calc(100%+1.5rem)] scale-95 opacity-0"}`}
    >
      <div className="pointer-events-auto relative flex h-13 w-full max-w-[720px] items-center justify-between gap-6 overflow-hidden rounded-full border border-black/[0.08] bg-paper-frost/85 dark:border-white/10 pl-6 pr-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.22)] backdrop-blur-xl backdrop-saturate-150">
        {/* Reading progress along the capsule's bottom edge, kept clear of the rounded ends. */}
        <div
          ref={bar}
          aria-hidden
          className="absolute inset-x-7 bottom-0 h-px origin-left bg-ink/70"
          style={{ transform: "scaleX(var(--p, 0))" }}
        />
        <a href="#top" className="truncate font-display text-nav-title">
          {name}
        </a>
        <nav aria-label={t("nav.sections")} className="flex shrink-0 items-center gap-3 sm:gap-6">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "location" : undefined}
              className={`hidden text-control transition-colors duration-300 hover:text-ink sm:inline ${active === item.href ? "text-ink" : "text-ink/60"}`}
            >
              {t(item.key)}
            </a>
          ))}
          <Preferences />
          <BluePill href="#contact" className="py-2 max-sm:!hidden">
            {t("nav.letsTalk")}
          </BluePill>
          <button
            type="button"
            onClick={onMenu}
            aria-label={t("nav.openMenu")}
            aria-controls="mobile-menu"
            className="-ml-2 flex h-9 w-9 items-center justify-center sm:hidden"
          >
            <span className="relative block h-2.5 w-5">
              <span className="absolute inset-x-0 top-0 h-[1.5px] bg-ink" />
              <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink" />
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
