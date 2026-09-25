import type { Env } from "../../server/portfolio";

// Serves R2 objects same-origin. The public r2.dev URL is blocked by several Indonesian ISPs
// (Internet Positif DNS filtering), so images must not be loaded from it directly.

const TYPES: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  gif: "image/gif",
  pdf: "application/pdf",
};

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

export const onRequestGet: PagesFunction<Env, "path"> = async ({ request, env, params, waitUntil }) => {
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const key = segments.filter(Boolean).join("/");
  if (!key || segments.some((s) => s === ".." || s === ".")) return notFound();

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const object = await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", TYPES[key.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream");
  }

  // Precondition matched (If-None-Match / If-Modified-Since): R2 returns metadata without a body.
  if (!("body" in object)) return new Response(null, { status: 304, headers });

  const response = new Response(object.body, { headers });
  waitUntil(cache.put(request, response.clone()));
  return response;
};
