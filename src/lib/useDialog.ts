import { type RefObject, useEffect, useRef } from "react";

/** Escape to close, focus moved into the dialog on open and handed back on close. */
export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    }, 60);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, ref]);
}
