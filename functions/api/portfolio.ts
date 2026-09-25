import { type Env, loadPortfolio } from "../../server/portfolio";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const portfolio = await loadPortfolio(env.DB);
  if (!portfolio) {
    return Response.json({ error: "Portfolio content has not been seeded yet." }, { status: 503 });
  }
  return Response.json(portfolio, { headers: { "Cache-Control": "public, max-age=60" } });
};
