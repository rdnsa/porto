import { useEffect, useState } from "react";
import type { Portfolio } from "../../shared/types";

// In production the Pages Function embeds the D1 content in the page, so this is synchronous.
function readEmbedded(): Portfolio | null {
  const text = document.getElementById("portfolio-data")?.textContent;
  if (!text) return null;
  try {
    return JSON.parse(text) as Portfolio;
  } catch {
    return null;
  }
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(readEmbedded);

  useEffect(() => {
    if (portfolio) return;
    let cancelled = false;
    (async () => {
      try {
        // Time-boxed: a stuck API (e.g. a hung `wrangler pages dev` behind Vite's proxy) must not leave a blank page.
        const response = await fetch("/api/portfolio", {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as Portfolio;
        if (!cancelled) setPortfolio(data);
      } catch (error) {
        // Dev without Wrangler, or D1 unreachable: fall back to the seed content bundled separately.
        console.warn("Using bundled portfolio content:", error);
        const { default: seed } = await import("../../content/portfolio.json");
        if (!cancelled) setPortfolio(seed as unknown as Portfolio);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [portfolio]);

  return portfolio;
}
