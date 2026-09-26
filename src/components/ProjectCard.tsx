import { ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";
import type { Project } from "../../shared/types";
import { media } from "../lib/media";
import { useT } from "../lib/prefs";

// The cover sits inset on the left and runs off the card's right edge. Dashboards show their
// top-left corner at 150% width; heroes and photos fill the same window cropped from the centre
// (oversized by the hover shift so no gap opens when it moves up and left).
const COVER_BASE =
  "absolute left-7 top-0 max-w-none rounded-tl-[18px] transition-transform duration-700 ease-out-quint group-hover:-translate-x-3 group-hover:-translate-y-2 sm:left-9";
const COVER_FOCUS: Record<Project["coverFocus"], string> = {
  start: "w-[150%]",
  center: "h-[calc(100%+0.5rem)] w-[calc(100%-1rem)] object-cover object-center sm:w-[calc(100%-1.5rem)]",
};

/** DESIGN.md media card: black or white, copy on top, the product cover bleeding off the bottom right. */
export function ProjectCard({
  project,
  position,
  total,
  interactive,
  onOpen,
}: {
  project: Project;
  position: number;
  total: number;
  /** False while the carousel is being dragged: no hover lift. */
  interactive: boolean;
  onOpen: (event: MouseEvent, slug: string) => void;
}) {
  const t = useT();
  const dark = project.theme === "dark";

  return (
    <article
      aria-roledescription="slide"
      aria-label={t("work.slideLabel", { index: position, total, name: project.name })}
      className={`group relative flex h-[520px] w-[84vw] max-w-[400px] shrink-0 snap-center flex-col overflow-hidden rounded-card transition-transform duration-500 ease-out-quint sm:h-[580px] sm:w-[400px] short:h-[440px] ${dark ? "bg-black text-white dark:bg-[#2a2a2c]" : "bg-gallery-white text-ink"} ${interactive ? "hover:-translate-y-1" : ""}`}
    >
      <div className="p-7 sm:p-9">
        <p className={`text-control font-semibold ${dark ? "text-white/60" : "text-slate"}`}>{project.category}</p>
        <h3 className="mt-2 text-title">{project.name}</h3>
        <p className={`mt-3 line-clamp-4 text-body short:line-clamp-2 ${dark ? "text-white/75" : "text-ink/75"}`}>
          {project.summary}
        </p>
        <a
          href={`/work/${project.slug}`}
          onClick={(event) => onOpen(event, project.slug)}
          draggable={false}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-pricing-blue py-2.5 pl-5 pr-4 text-[15px] leading-none tracking-normal text-white transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:bg-[#0077ed]"
        >
          {t("work.viewCase")}
          <ArrowRight aria-hidden size={16} strokeWidth={2.25} className="transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
        </a>
      </div>
      <div className="relative mt-auto h-[42%]">
        <img
          src={media(project.cover)}
          alt={project.coverAlt}
          loading="lazy"
          draggable={false}
          className={`${COVER_BASE} ${COVER_FOCUS[project.coverFocus] ?? COVER_FOCUS.start} ${dark ? "ring-1 ring-white/10" : "ring-1 ring-black/5 dark:ring-white/10"}`}
        />
      </div>
    </article>
  );
}
