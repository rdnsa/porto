import { useEffect, useRef, useState } from "react";
import { NAV } from "../lib/nav";
import { useScrollVar } from "../lib/scroll";
import { BluePill } from "./ui";

const pageProgress = () =>
  window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

/** DESIGN.md "Product Local Navigation": a frosted 52px bar that slides in once the hero is gone. */
export function LocalNav({ name, onMenu }: { name: string; onMenu: () => void }) {
  const bar = useRef<HTMLDivElement>(null);
  useScrollVar(bar, pageProgress);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-52px 0px 0px 0px",
    });
    observer.observe(hero);
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
      className={`fixed inset-x-0 top-0 z-[35] transition-transform duration-500 ease-out-quint ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="relative border-b border-black/10 bg-paper-frost/80 backdrop-blur-xl backdrop-saturate-150">
        {/* Reading progress along the bar's bottom edge. */}
        <div
          ref={bar}
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-ink"
          style={{ transform: "scaleX(var(--p, 0))" }}
        />
        <div className="page flex h-13 items-center justify-between gap-6">
          <a href="#top" className="font-display text-nav-title">
            {name}
          </a>
          <nav aria-label="Sections" className="flex items-center gap-5 sm:gap-7">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "location" : undefined}
                className={`hidden text-control transition-colors duration-300 hover:text-ink sm:inline ${active === item.href ? "text-ink" : "text-ink/60"}`}
              >
                {item.label}
              </a>
            ))}
            <BluePill href="#contact" className="py-1">
              Let&rsquo;s talk
            </BluePill>
            <button
              type="button"
              onClick={onMenu}
              aria-label="Open menu"
              aria-controls="mobile-menu"
              className="-mr-2 flex h-9 w-9 items-center justify-center sm:hidden"
            >
              <span className="relative block h-2.5 w-5">
                <span className="absolute inset-x-0 top-0 h-[1.5px] bg-ink" />
                <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink" />
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
