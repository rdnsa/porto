import type { Env } from "../../server/portfolio";

const LIMITS = { name: 120, email: 200, message: 4000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PER_WINDOW = 3; // messages per IP per 10 minutes

// `code` lets the page show the message in the visitor's language; `error` is the English fallback.
const fail = (status: number, error: string, code = "generic") => Response.json({ ok: false, error, code }, { status });

const field = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

async function hashIp(ip: string) {
  // A daily salt keeps the hash useful for rate limiting without making visitors trackable over time.
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day}:${ip}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return fail(415, "Send the form as JSON.");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, "The form data could not be read.");
  }

  // Honeypot: real visitors never see the "company" field, bots fill it in. Pretend it worked.
  if (field(body.company, 200)) return Response.json({ ok: true }, { status: 201 });

  const name = field(body.name, LIMITS.name);
  const email = field(body.email, LIMITS.email);
  const message = field(body.message, LIMITS.message);
  if (!name || !email || !message) return fail(422, "Please fill in your name, email and message.", "missing_fields");
  if (!EMAIL.test(email)) return fail(422, "That email address doesn't look right.", "invalid_email");

  const ip = request.headers.get("CF-Connecting-IP");
  const ipHash = ip ? await hashIp(ip) : null;
  if (ipHash) {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM messages WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')",
    )
      .bind(ipHash)
      .first<number>("count");
    if ((recent ?? 0) >= MAX_PER_WINDOW) return fail(429, "Too many messages — please try again in a few minutes.", "rate_limited");
  }

  await env.DB.prepare(
    "INSERT INTO messages (name, email, message, ip_hash, country, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(
      name,
      email,
      message,
      ipHash,
      (request.cf?.country as string | undefined) ?? null,
      request.headers.get("User-Agent")?.slice(0, 300) ?? null,
    )
    .run();

  return Response.json({ ok: true }, { status: 201 });
};

export const onRequest: PagesFunction<Env> = () =>
  new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
