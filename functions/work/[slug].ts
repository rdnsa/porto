import { homeMeta, projectMeta, renderDocument } from "../../server/document";
import { type Env, loadPortfolio } from "../../server/portfolio";

// "/work/:slug" — deep link to a case study, with that project's title, description and cover as meta.
export const onRequestGet: PagesFunction<Env, "slug"> = async ({ env, params, request }) => {
  const shell = await env.ASSETS.fetch(new URL("/", request.url));

  try {
    const portfolio = await loadPortfolio(env.DB);
    if (!portfolio) return shell;
    const project = portfolio.projects.find((p) => p.slug === params.slug);
    const meta = project ? projectMeta(portfolio, project, env.SITE_URL) : homeMeta(portfolio, env.SITE_URL);
    return renderDocument(shell, portfolio, meta, env.SITE_URL, project ? 200 : 404);
  } catch (error) {
    console.error("Could not embed portfolio data", error);
    return shell;
  }
};
