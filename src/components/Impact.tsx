import { useEffect, useRef } from "react";
import type { Stat } from "../../shared/types";
import { useT } from "../lib/prefs";
import { Reveal, SectionHeading } from "./ui";

/** The one dark chapter: outcomes set large in cream on black. */
export function Impact({ stats }: { stats: Stat[] }) {
  const t = useT();
  if (!stats.length) return null;
  return (
    <section aria-labelledby="impact-title" className="bg-black py-[90px] text-cream sm:py-32 dark:bg-studio-mist">
      <div className="page">
        <SectionHeading id="impact-title" kicker={t("impact.kicker")} title={t("impact.title")} aside={t("impact.aside")} tone="dark" />
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

/**
 * Counts the numeric part of a stat ("224k", "−66%", "~3 wks", "3.97") up from zero whenever it
 * comes into view, and resets once it is fully off screen so scrolling back replays it. Frames are
 * written straight to the text node, so the count never re-renders React.
 */
function CountUp({ value }: { value: string }) {
  const match = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!match || !node) return;
    const [, prefix, number, suffix] = match;
    const target = Number(number);
    const decimals = number.split(".")[1]?.length ?? 0;
    const show = (n: number) => {
      node.textContent = `${prefix}${n.toFixed(decimals)}${suffix}`;
    };
    let frame = 0;
    let played = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(frame);
          played = false;
          show(0);
          return;
        }
        if (played || entry.intersectionRatio < 0.3) return;
        played = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          show(target * easeOutExpo(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: [0, 0.3] },
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
  const zero = (0).toFixed(number.split(".")[1]?.length ?? 0);

  return (
    <span>
      <span className="sr-only">{value}</span>
      {/* Starts at zero (hidden by the section reveal anyway) so the final value never flashes first. */}
      <span ref={ref} aria-hidden>
        {prefix}
        {zero}
        {suffix}
      </span>
    </span>
  );
}
