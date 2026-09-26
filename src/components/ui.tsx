import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useScrollVar } from "../lib/scroll";
import { observeViewport } from "../lib/viewport";

/** Renders **bold** markers from the content as <strong>. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Fades content into place every time it scrolls into view, in both directions: it rises from
 * below on the way down and drops in from above on the way back up. With `stagger`, the direct
 * children enter one after another (in reverse order when coming from above).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Visibility lives in data attributes written straight to the DOM (data-visible, and data-from
  // for the side it last left through), so scrolling never re-renders React.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (stagger) {
      const items = [...node.children] as HTMLElement[];
      node.style.setProperty("--n", String(items.length));
      items.forEach((item, i) => item.style.setProperty("--i", String(i)));
    }
    return observeViewport(
      node,
      (entry) => {
        const side = entry.boundingClientRect.top < 0 ? "above" : "below";
        if (!entry.isIntersecting) {
          delete node.dataset.visible;
          node.dataset.from = side;
          return;
        }
        if ((node.dataset.from ?? "below") !== side) {
          // Jumped straight past it (anchor link, fast fling), so it is still parked on the other
          // side: move it to the side it is really entering from without animating that move.
          node.dataset.snap = "";
          node.dataset.from = side;
          void node.offsetWidth;
          delete node.dataset.snap;
        }
        node.dataset.visible = "";
      },
      "0px 0px -8% 0px",
    );
  }, [stagger]);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <div ref={ref} className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Kicker + headline + optional grey continuation, the way Apple introduces a chapter. */
export function SectionHeading({
  kicker,
  title,
  aside,
  id,
  tone = "light",
}: {
  kicker?: string;
  title: string;
  aside?: string;
  id?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Reveal stagger>
      {kicker && <p className={`text-kicker ${tone === "dark" ? "text-cream/60" : "text-slate"}`}>{kicker}</p>}
      <h2 id={id} className={`text-headline ${kicker ? "mt-3" : ""} max-w-[24ch]`}>
        {title}
        {aside && <span className={tone === "dark" ? "text-cream/45" : "text-steel"}> {aside}</span>}
      </h2>
    </Reveal>
  );
}

/** The one filled control in the system: DESIGN.md "Pricing Blue Pill". */
export function BluePill({
  href,
  children,
  onClick,
  className = "",
  style,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={style}
      className={`inline-flex items-center rounded-full bg-pricing-blue px-4 py-1.5 text-control text-white transition-colors duration-300 hover:bg-[#0077ed] ${className}`}
    >
      {children}
    </a>
  );
}

// 0 when the heading's top reaches the lower part of the screen, 1 once it is well into view.
const readingProgress = (rect: DOMRect, viewportHeight: number) =>
  (viewportHeight * 0.9 - rect.top) / (rect.height + viewportHeight * 0.4);

/**
 * A headline that "reads itself" as you scroll: words brighten one after another, the way
 * Apple pages light up long statements. `muted` words finish in Steel grey instead of Ink.
 */
export function ScrollWords({
  id,
  lead,
  muted = "",
  className = "",
}: {
  id?: string;
  lead: string;
  muted?: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useScrollVar(ref, readingProgress);
  const words = [
    ...lead.split(/\s+/).filter(Boolean).map((word) => ({ word, muted: false })),
    ...muted.split(/\s+/).filter(Boolean).map((word) => ({ word, muted: true })),
  ];
  // A little headroom so the last words reach full strength before the heading leaves.
  const steps = words.length + 3;

  return (
    <h2 ref={ref} id={id} className={className}>
      {words.map(({ word, muted: isMuted }, i) => (
        <span
          key={i}
          className={isMuted ? "text-steel" : undefined}
          style={{ opacity: `clamp(0.15, calc(var(--p, 1) * ${steps} - ${i}), 1)` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}
