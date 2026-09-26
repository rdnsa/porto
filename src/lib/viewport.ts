type Callback = (entry: IntersectionObserverEntry) => void;

// One IntersectionObserver per rootMargin for the whole page instead of one per element: the page
// has dozens of reveals, and a single observer batches all their checks into one pass.
const observers = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, Callback> }>();

/** Calls `callback` whenever `node` enters or leaves the viewport. Returns an unsubscribe function. */
export function observeViewport(node: Element, callback: Callback, rootMargin = "0px"): () => void {
  let shared = observers.get(rootMargin);
  if (!shared) {
    const callbacks = new Map<Element, Callback>();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => callbacks.get(entry.target)?.(entry)),
      { rootMargin },
    );
    shared = { observer, callbacks };
    observers.set(rootMargin, shared);
  }
  shared.callbacks.set(node, callback);
  shared.observer.observe(node);

  const { observer, callbacks } = shared;
  return () => {
    observer.unobserve(node);
    callbacks.delete(node);
  };
}
