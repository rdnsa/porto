import { ChevronLeft, ChevronRight, Pause, Play, Plus } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Project } from "../../shared/types";
import { media } from "../lib/media";
import { useT } from "../lib/prefs";
import { prefersReducedMotion } from "../lib/scroll";
import { Reveal, SectionHeading } from "./ui";

const GAP = 20;
const SLIDE_MS = 2000;
const DRAG_THRESHOLD = 6;

// Covers whose subject sits in the middle of the frame (a hero, a product photo). They keep the same
// bleed-off-the-right-edge placement as the dashboards, but the visible window is cut from their centre.
const CENTRED_COVERS = new Set(["ifc-news", "aix-expo", "genius-ai", "nordpartners"]);

/**
 * DESIGN.md "Highlights Stage": a Studio Mist band with a sideways run of 28px media cards.
 * Advances on its own (paused while hovered, focused, dragged or off-screen), swipes on touch,
 * drags with a mouse, and answers the arrow keys.
 */
export function Work({ projects, onOpen }: { projects: Project[]; onOpen: (slug: string) => void }) {
  const t = useT();
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  // Always starts playing (every 2s); the pause button is there for anyone who wants it still.
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const running = playing && !hovered && !focused && !dragging && inView;

  const step = () => (scroller.current?.querySelector("article")?.offsetWidth ?? 0) + GAP;

  const sync = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const end = node.scrollLeft >= node.scrollWidth - node.clientWidth - 4;
    setAtEnd(end);
    setIndex(end ? projects.length - 1 : Math.round(node.scrollLeft / Math.max(step(), 1)));
  }, [projects.length]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  // Only count down while the carousel is actually on screen and the tab is visible.
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    let visible = false;
    const update = () => setInView(visible && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const go = (target: number) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, target));
    scroller.current?.scrollTo({ left: clamped * step(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const advance = () => go(atEnd ? 0 : index + 1);

  const openCase = (event: MouseEvent, slug: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onOpen(slug);
  };

  // Mouse drag-to-scroll (touch and trackpads already scroll natively).
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const node = scroller.current;
    if (event.pointerType !== "mouse" || event.button !== 0 || !node) return;
    drag.current = { active: true, moved: false, startX: event.clientX, startScroll: node.scrollLeft };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const node = scroller.current;
    if (!state.active || !node) return;
    const dx = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      state.moved = true;
      setDragging(true);
      node.setPointerCapture(event.pointerId);
      node.style.scrollSnapType = "none";
      node.style.scrollBehavior = "auto";
    }
    node.scrollLeft = state.startScroll - dx;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const node = scroller.current;
    if (!state.active || !node) return;
    state.active = false;
    if (!state.moved) return;
    if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    const dx = event.clientX - state.startX;
    // Flick direction wins over position, so a short drag still turns the page.
    const base = state.startScroll / Math.max(step(), 1);
    const target = Math.abs(dx) > 60 ? Math.round(base) + (dx < 0 ? 1 : -1) : Math.round(node.scrollLeft / step());
    node.style.scrollSnapType = "";
    node.style.scrollBehavior = "";
    go(target);
    setDragging(false);
  };

  // A drag that ends over a card must not also open it.
  const onClickCapture = (event: MouseEvent) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
    else return;
    event.preventDefault();
  };

  return (
    <section
      ref={section}
      id="work"
      aria-labelledby="work-title"
      aria-roledescription="carousel"
      className="overflow-hidden bg-studio-mist py-[90px] sm:py-32"
    >
      <div className="page flex items-end justify-between gap-8">
        <SectionHeading
          id="work-title"
          kicker={t("work.kicker")}
          title={t("work.title")}
          aside={t("work.aside", { count: projects.length })}
        />
        <a href="#contact" className="mb-2 hidden shrink-0 text-body text-apple-blue hover:underline md:inline">
          {t("work.startConversation")}
        </a>
      </div>

      <Reveal delay={100}>
        <div
          ref={scroller}
          tabIndex={0}
          aria-label={t("work.carouselLabel")}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
          className={`bleed no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-offset-8 lg:mt-16 ${dragging ? "cursor-grabbing select-none" : "md:cursor-grab"}`}
        >
          {projects.map((project, i) => {
            const dark = project.theme === "dark";
            return (
              <article
                key={project.slug}
                aria-roledescription="slide"
                aria-label={t("work.slideLabel", { index: i + 1, total: projects.length, name: project.name })}
                className={`group relative flex h-[520px] w-[84vw] max-w-[400px] shrink-0 snap-start flex-col overflow-hidden rounded-card transition-transform duration-500 ease-out-quint sm:h-[580px] sm:w-[400px] short:h-[440px] ${dark ? "bg-black text-white dark:bg-[#2a2a2c]" : "bg-gallery-white text-ink"} ${dragging ? "" : "hover:-translate-y-1"}`}
              >
                <span
                  aria-hidden
                  className={`absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full transition-[transform,background-color] duration-500 ease-out-quint group-hover:rotate-90 sm:right-6 sm:top-6 ${dark ? "bg-white/15 text-white group-hover:bg-white/25" : "bg-black/[0.06] text-ink group-hover:bg-black/[0.12] dark:bg-white/10 dark:group-hover:bg-white/20"}`}
                >
                  <Plus size={18} strokeWidth={2} />
                </span>
                <div className="p-7 pr-16 sm:p-9 sm:pr-16">
                  <p className={`text-control font-semibold ${dark ? "text-white/60" : "text-slate"}`}>{project.category}</p>
                  <h3 className="mt-2 text-title">{project.name}</h3>
                  <p className={`mt-3 line-clamp-4 text-body short:line-clamp-2 ${dark ? "text-white/75" : "text-ink/75"}`}>
                    {project.summary}
                  </p>
                  <a
                    href={`/work/${project.slug}`}
                    onClick={(event) => openCase(event, project.slug)}
                    draggable={false}
                    className={`mt-4 inline-block text-body after:absolute after:inset-0 after:content-[''] group-hover:underline ${dark ? "text-apple-blue-dark" : "text-apple-blue"}`}
                  >
                    {t("work.viewCase")} <span aria-hidden>›</span>
                  </a>
                </div>
                <div className="relative mt-auto h-[42%]">
                  <img
                    src={media(project.cover)}
                    alt={project.coverAlt}
                    loading="lazy"
                    draggable={false}
                    className={CENTRED_COVERS.has(project.slug)
                      ? `absolute -bottom-2 -right-3 left-7 top-0 h-[calc(100%+0.5rem)] w-[calc(100%-1.75rem+0.75rem)] max-w-none rounded-tl-[18px] object-cover object-center transition-transform duration-700 ease-out-quint group-hover:-translate-x-3 group-hover:-translate-y-2 sm:left-9 sm:w-[calc(100%-2.25rem+0.75rem)] ${dark ? "ring-1 ring-white/10" : "ring-1 ring-black/5 dark:ring-white/10"}`
                      : `absolute left-7 top-0 w-[150%] max-w-none rounded-tl-[18px] transition-transform duration-700 ease-out-quint group-hover:-translate-x-3 group-hover:-translate-y-2 sm:left-9 ${dark ? "ring-1 ring-white/10" : "ring-1 ring-black/5 dark:ring-white/10"}`}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      <div className="page mt-8 flex items-center justify-center gap-3">
        <CarouselButton label={t("work.previous")} disabled={index === 0} onClick={() => go(index - 1)} className="hidden sm:grid">
          <ChevronLeft size={20} strokeWidth={2} />
        </CarouselButton>
        <div className="flex h-11 items-center gap-2.5 rounded-[36px] bg-[rgba(210,210,215,0.64)] px-5 backdrop-blur-md dark:bg-[rgba(66,66,69,0.72)]">
          {projects.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => go(i)}
              aria-label={t("work.show", { name: project.name })}
              aria-current={i === index ? "true" : undefined}
              className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ease-out-quint before:absolute before:-inset-3 before:content-[''] ${i === index ? "w-8 bg-black/20 dark:bg-white/20" : "w-2 bg-black/25 hover:bg-black/40 dark:bg-white/30 dark:hover:bg-white/50"}`}
            >
              {i === index &&
                (playing ? (
                  <span
                    key={`${index}-${atEnd}`}
                    onAnimationEnd={advance}
                    className="dot-fill absolute inset-0 rounded-full bg-black/60 dark:bg-white/85"
                    style={{ animationPlayState: running ? "running" : "paused", ["--dot-duration" as string]: `${SLIDE_MS}ms` }}
                  />
                ) : (
                  <span className="absolute inset-0 rounded-full bg-black/60 dark:bg-white/85" />
                ))}
            </button>
          ))}
        </div>
        <CarouselButton label={t("work.next")} disabled={atEnd} onClick={() => go(index + 1)} className="hidden sm:grid">
          <ChevronRight size={20} strokeWidth={2} />
        </CarouselButton>
        <CarouselButton
          label={t(playing ? "work.pause" : "work.play")}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? <Pause size={16} strokeWidth={2} fill="currentColor" /> : <Play size={16} strokeWidth={2} fill="currentColor" />}
        </CarouselButton>
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  disabled = false,
  onClick,
  className = "grid",
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`size-11 place-items-center rounded-full bg-[rgba(210,210,215,0.64)] text-black/60 backdrop-blur-md transition-[opacity,background-color,transform] duration-300 hover:bg-[rgba(210,210,215,0.9)] dark:bg-[rgba(66,66,69,0.72)] dark:text-white/80 dark:hover:bg-[rgba(86,86,90,0.9)] active:scale-95 disabled:opacity-35 ${className}`}
    >
      {children}
    </button>
  );
}
