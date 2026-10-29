import { type Env, loadPortfolioCached } from "../server/portfolio";

export const onRequestGet: PagesFunction<Env> = async ({ env, waitUntil }) => {
  const portfolio = await loadPortfolioCached(env, waitUntil);
  const urls = [`${env.SITE_URL}/`, ...(portfolio?.projects ?? []).map((p) => `${env.SITE_URL}/work/${p.slug}`)];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n") +
    "\n</urlset>\n";
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
