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

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
