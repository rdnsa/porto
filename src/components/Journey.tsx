import { Minus, Plus } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import type { Experience } from "../../shared/types";
import { Reveal, SectionHeading } from "./ui";

const PREVIEW = 3;

/** Rows in the middle band of the screen; the topmost one is "in focus". */
function useFocusedRow(list: RefObject<HTMLOListElement | null>) {
  const [focused, setFocused] = useState<number | null>(null);
  useEffect(() => {
    const rows = [...(list.current?.children ?? [])];
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = rows.indexOf(entry.target);
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
        }
        setFocused(visible.size ? Math.min(...visible) : null);
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [list]);
  return focused;
}

export function Journey({ experience }: { experience: Experience[] }) {
  const list = useRef<HTMLOListElement>(null);
  const focused = useFocusedRow(list);
  return (
    <section id="journey" aria-labelledby="journey-title" className="bg-gallery-white py-[90px] sm:py-32">
      <div className="page">
        <SectionHeading id="journey-title" kicker="Journey" title="Where I've led and shipped." aside="From code to roadmaps." />
        <ol ref={list} className="mt-12 border-t border-hairline-silver lg:mt-16">
          {experience.map((job, i) => (
            <Role key={`${job.company}-${job.start}`} job={job} state={focused === null ? "idle" : focused === i ? "focus" : "dim"} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Role({ job, state }: { job: Experience; state: "idle" | "focus" | "dim" }) {
  const [expanded, setExpanded] = useState(false);
  const current = /present|sekarang|now/i.test(job.end);
  const points = expanded ? job.points : job.points.slice(0, PREVIEW);

  return (
    // On larger screens the role being read stays at full strength and the rest step back.
    <li
      className={`border-b border-hairline-silver transition-opacity duration-700 ease-out-quint md:hover:opacity-100 ${state === "dim" ? "md:opacity-40" : ""}`}
    >
      <Reveal className="grid gap-4 py-10 md:grid-cols-12 md:gap-8 lg:py-12">
        <div className="md:col-span-3">
          <p className="flex items-center gap-2.5 text-body-sm text-ink">
            <span
              aria-hidden
              className={`size-2 rounded-full bg-ink transition-transform duration-500 ease-out-quint ${state === "focus" ? "scale-100" : "scale-50 opacity-40"}`}
            />
            {job.start} — {job.end}
          </p>
          <p className="mt-1 text-body-sm text-slate">{job.location}</p>
          {/* DESIGN.md "Launch Status Label": bare orange text, no pill. */}
          {current && <p className="mt-3 text-control font-semibold text-launch-orange">Current role</p>}
        </div>
        <div className="md:col-span-9">
          <h3 className="text-subtitle">{job.role}</h3>
          <p className="mt-1.5 text-body">
            {job.company}
            {job.companyNote && <span className="text-slate"> · {job.companyNote}</span>}
          </p>
          <p className="mt-3 max-w-[64ch] text-body text-slate">{job.summary}</p>
          <ul className="mt-6 max-w-[70ch] space-y-3 text-body text-ink/80">
            {points.map((point) => (
              <li key={point} className="flex gap-3">
                <span aria-hidden className="mt-[0.62em] size-1 shrink-0 rounded-full bg-ink/40" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {job.points.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mt-5 inline-flex items-center gap-1.5 text-body text-apple-blue hover:underline"
            >
              {expanded ? "Show less" : `Show all ${job.points.length}`}
              {expanded ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
            </button>
          )}
        </div>
      </Reveal>
    </li>
  );
}
