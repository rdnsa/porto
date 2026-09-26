import { type RefObject, useEffect } from "react";

type Listener = () => void;

// One passive scroll/resize listener for the whole page, batched to a single frame.
const listeners = new Set<Listener>();
let frame = 0;

function flush() {
  frame = 0;
  listeners.forEach((listener) => listener());
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function subscribe(listener: Listener) {
  if (listeners.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  listeners.add(listener);
  listener();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Writes a 0–1 scroll progress into a CSS custom property on the element, so styles can
 * interpolate with calc() without React re-rendering on every frame. It runs regardless of
 * prefers-reduced-motion, like the scroll reveals.
 */
export function useScrollVar(
  ref: RefObject<HTMLElement | null>,
  progress: (rect: DOMRect, viewportHeight: number) => number,
  name = "--p",
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let last = -1;
    return subscribe(() => {
      const value = Math.round(clamp01(progress(node.getBoundingClientRect(), window.innerHeight)) * 1000) / 1000;
      if (value !== last) {
        node.style.setProperty(name, String(value));
        last = value;
      }
    });
    // `progress` is expected to be a stable module-level function, so it is not a dependency.
  }, [ref, name]);
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Glides a horizontal scroller to `left` with an eased animation instead of the browser's short,
 * linear-feeling smooth scroll. Snap is lifted for the ride (it would fight every frame) and put back
 * on arrival. Longer trips take a little longer, so a wrap back to the first slide doesn't whip past.
 * Returns a cancel function (for a drag or touch that interrupts it).
 */
export function glideScroll(node: HTMLElement, left: number): () => void {
  const from = node.scrollLeft;
  const to = Math.max(0, Math.min(left, node.scrollWidth - node.clientWidth));
  const distance = to - from;
  const release = () => {
    node.style.scrollSnapType = "";
    node.style.scrollBehavior = "";
  };
  if (Math.abs(distance) < 1) {
    release();
    return () => {};
  }

  const duration = Math.min(1200, Math.max(650, 450 + Math.abs(distance) * 0.5));
  node.style.scrollSnapType = "none";
  node.style.scrollBehavior = "auto";

  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    node.scrollLeft = from + distance * easeInOutCubic(t);
    if (t < 1) raf = requestAnimationFrame(tick);
    else release();
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    release();
  };
}
