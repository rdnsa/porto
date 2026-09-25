import { useEffect, useRef, useState } from "react";
import type { Stat } from "../../shared/types";
import { prefersReducedMotion } from "../lib/scroll";
import { Reveal, SectionHeading } from "./ui";

/** The one dark chapter: outcomes set large in cream on black. */
export function Impact({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-labelledby="impact-title" className="bg-black py-[90px] text-cream sm:py-32">
      <div className="page">
        <SectionHeading id="impact-title" kicker="Impact" title="Outcomes, not output." aside="The numbers behind the work." tone="dark" />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12 lg:mt-20">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={(i % 3) * 90} className="group border-t border-cream/15 pt-6">
              <p className="font-display text-[clamp(2.25rem,0.9rem+5vw,5.5rem)] font-semibold leading-none tracking-[-0.035em] tabular-nums">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-4 text-body font-semibold">{stat.label}</p>
              {stat.detail && (
                <p className="mt-1 text-body-sm text-cream/55 transition-colors duration-300 group-hover:text-cream/80">
                  {stat.detail}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const DURATION = 1600;
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/** Counts the numeric part of a stat ("224k", "−66%", "~3 wks", "3.97") up from zero once in view. */
function CountUp({ value }: { value: string }) {
  const match = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  // Start at zero (hidden by the section reveal anyway) so the final value never flashes first.
  const [current, setCurrent] = useState<number | null>(() => (match && !prefersReducedMotion() ? 0 : null));

  useEffect(() => {
    const node = ref.current;
    if (!match || !node || prefersReducedMotion()) return;
    const target = Number(match[2]);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          setCurrent(target * easeOutExpo(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setCurrent(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // Re-run only when the stat itself changes.
  }, [value]);

  if (!match) return <>{value}</>;
  const [, prefix, number, suffix] = match;
  const decimals = number.split(".")[1]?.length ?? 0;
  const shown = current === null ? number : current.toFixed(decimals);

  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {prefix}
        {shown}
        {suffix}
      </span>
    </span>
  );
}
