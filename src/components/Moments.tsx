import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { Moment } from "../../shared/types";
import { media } from "../lib/media";
import { useT } from "../lib/prefs";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useDialog } from "../lib/useDialog";
import { Reveal, SectionHeading } from "./ui";

/** "Off the roadmap": a masonry of photos that open in a full-screen viewer. */
export function Moments({ moments }: { moments: Moment[] }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  if (!moments.length) return null;

  return (
    <section id="moments" aria-labelledby="moments-title" className="bg-gallery-white pb-[90px] sm:pb-32">
      <div className="page">
        <SectionHeading id="moments-title" kicker={t("moments.kicker")} title={t("moments.title")} aside={t("moments.aside")} />
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:mt-16 lg:columns-3">
          {moments.map((moment, i) => (
            <Reveal key={moment.src} delay={(i % 3) * 90} className="mb-5 break-inside-avoid">
              <figure>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={t("moments.view", { caption: moment.caption ?? moment.alt })}
                  className="group block w-full overflow-hidden rounded-card bg-studio-mist"
                >
                  <img
                    src={media(moment.src)}
                    alt={moment.alt}
                    loading="lazy"
                    className="w-full transition-transform duration-700 ease-out-quint group-hover:scale-[1.03]"
                  />
                </button>
                {moment.caption && <figcaption className="mt-3 px-1 text-body-sm text-slate">{moment.caption}</figcaption>}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
      <Viewer moments={moments} index={open} onChange={setOpen} />
    </section>
  );
}

function Viewer({
  moments,
  index,
  onChange,
}: {
  moments: Moment[];
  index: number | null;
  onChange: (index: number | null) => void;
}) {
  const t = useT();
  const dialog = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  // Keeps the last photo on screen while the viewer fades out.
  const [shown, setShown] = useState(index);
  const open = index !== null;

  const close = useCallback(() => onChange(null), [onChange]);
  const step = useCallback(
    (by: number) => index !== null && onChange((index + by + moments.length) % moments.length),
    [index, moments.length, onChange],
  );

  useBodyScrollLock(open);
  useDialog(dialog, open, close);

  useEffect(() => {
    if (index !== null) setShown(index);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  const onPointerDown = (event: PointerEvent) => {
    swipe.current = { x: event.clientX, id: event.pointerId };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  const moment = shown === null ? null : moments[shown];

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={t("moments.viewer")}
      inert={!open}
      className={`fixed inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur-xl transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="flex items-center justify-between px-5 py-4 text-body-sm text-cream/70 sm:px-8">
        <span aria-live="polite">{shown !== null && `${shown + 1} / ${moments.length}`}</span>
        <button
          type="button"
          onClick={close}
          data-autofocus
          aria-label={t("moments.close")}
          className="grid size-10 place-items-center rounded-full bg-white/10 text-cream transition-colors duration-300 hover:bg-white/20"
        >
          <X size={20} strokeWidth={1.75} />
        </button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 sm:px-20"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        {moment && (
          <img
            key={moment.src}
            src={media(moment.src)}
            alt={moment.alt}
            draggable={false}
            className={`anim-fade-in max-h-full max-w-full select-none rounded-[18px] object-contain transition-transform duration-500 ease-out-quint ${open ? "scale-100" : "scale-95"}`}
            style={{ animationDuration: "0.5s" }}
          />
        )}
        {moments.length > 1 && (
          <>
            <ViewerButton label={t("moments.previous")} onClick={() => step(-1)} className="left-6">
              <ChevronLeft size={22} strokeWidth={2} />
            </ViewerButton>
            <ViewerButton label={t("moments.next")} onClick={() => step(1)} className="right-6">
              <ChevronRight size={22} strokeWidth={2} />
            </ViewerButton>
          </>
        )}
      </div>
      <p className="mx-auto min-h-16 max-w-2xl px-6 pb-6 pt-4 text-center text-body text-cream/85">{moment?.caption}</p>
    </div>
  );
}

function ViewerButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream transition-colors duration-300 hover:bg-white/20 sm:grid ${className}`}
    >
      {children}
    </button>
  );
}
