import { type Env, loadPortfolioCached } from "../../server/portfolio";

export const onRequestGet: PagesFunction<Env> = async ({ env, waitUntil }) => {
  const portfolio = await loadPortfolioCached(env, waitUntil);
  if (!portfolio) {
    return Response.json({ error: "Portfolio content has not been seeded yet." }, { status: 503 });
  }
  return Response.json(portfolio, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
};
