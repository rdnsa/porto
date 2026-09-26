import { useEffect } from "react";

const clearHash = () => {
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
};

function scrollToHash(hash: string) {
  if (hash === "#top") {
    window.scrollTo({ top: 0 });
    return true;
  }
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  target?.scrollIntoView();
  return target !== null;
}

/**
 * In-page links (#about, #contact, "Back to top"…) scroll smoothly (html's scroll-behavior) without
 * leaving the fragment in the address bar, so the URL stays clean and a reload starts at the top.
 * A shared link that arrives with a fragment is honoured once the content is on the page, then cleared.
 */
export function useInPageLinks(ready: boolean) {
  useEffect(() => {
    if (!ready || !location.hash) return;
    if (scrollToHash(location.hash)) clearHash();
  }, [ready]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      event.preventDefault();
      scrollToHash(hash);
      clearHash();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
