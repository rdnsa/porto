import { homeMeta, renderDocument } from "../server/document";
import { type Env, loadPortfolio } from "../server/portfolio";

// "/" — the SPA shell with the portfolio from D1 embedded, so the hero renders without an API call.
export const onRequestGet: PagesFunction<Env> = async ({ env, next }) => {
  const shell = await next();
  if (!shell.ok || !shell.headers.get("Content-Type")?.includes("text/html")) return shell;

  try {
    const portfolio = await loadPortfolio(env.DB);
    if (!portfolio) return shell;
    return renderDocument(shell, portfolio, homeMeta(portfolio, env.SITE_URL), env.SITE_URL);
  } catch (error) {
    console.error("Could not embed portfolio data", error);
    return shell;
  }
};
