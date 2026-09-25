import { useCallback, useEffect, useState } from "react";

const parse = (path: string) => /^\/work\/([a-z0-9-]+)\/?$/.exec(path)?.[1] ?? null;

/** Case studies live at /work/:slug and open as an overlay on top of the home page. */
export function useCaseRoute() {
  const [slug, setSlug] = useState(() => parse(window.location.pathname));

  useEffect(() => {
    const onPop = () => setSlug(parse(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = useCallback((next: string, { replace = false } = {}) => {
    const state = { caseStudy: true };
    if (replace) window.history.replaceState(state, "", `/work/${next}`);
    else window.history.pushState(state, "", `/work/${next}`);
    setSlug(next);
  }, []);

  const close = useCallback(() => {
    // Opened from the page: step back so the browser's back button stays in sync.
    if (window.history.state?.caseStudy) window.history.back();
    else {
      window.history.replaceState(null, "", "/");
      setSlug(null);
    }
  }, []);

  return { slug, open, close };
}
