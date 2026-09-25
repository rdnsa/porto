import type { Portfolio, Project } from "../shared/types";

export interface PageMeta {
  title: string;
  description: string;
  url: string;
  image: string | null;
  imageAlt: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const plain = (value: string) => value.replaceAll("**", "");

const absolute = (site: string, key: string | null) =>
  key ? (/^https?:\/\//.test(key) ? key : `${site}/media/${key}`) : null;

export function homeMeta(portfolio: Portfolio, site: string): PageMeta {
  const { profile } = portfolio;
  return {
    title: `${profile.firstName} ${profile.lastName} — ${profile.role}`,
    description: `${profile.fullName} — ${profile.role}. ${plain(profile.tagline)} ${plain(profile.intro)}`,
    url: `${site}/`,
    image: absolute(site, profile.ogImage),
    imageAlt: `${profile.firstName} ${profile.lastName}, ${profile.role}`,
  };
}

export function projectMeta(portfolio: Portfolio, project: Project, site: string): PageMeta {
  const { profile } = portfolio;
  return {
    title: `${project.name} — ${profile.firstName} ${profile.lastName}`,
    description: plain(`${project.tagline} ${project.summary}`),
    url: `${site}/work/${project.slug}`,
    image: absolute(site, project.cover),
    imageAlt: project.coverAlt,
  };
}

function personSchema(portfolio: Portfolio, site: string) {
  const { profile, socials, education } = portfolio;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: `${profile.firstName} ${profile.lastName}`,
    jobTitle: profile.role,
    url: `${site}/`,
    image: absolute(site, profile.portrait),
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: profile.location },
    worksFor: { "@type": "Organization", name: profile.currentCompany },
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    sameAs: socials.map((s) => s.url),
  };
}

/** Serialises JSON for an inline <script>, so "</script>" inside content cannot break out of it. */
const inlineJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\u003c");

/**
 * Streams the SPA shell with the portfolio embedded (no API round trip on first paint)
 * and page-specific meta tags for search engines and link previews.
 */
export function renderDocument(shell: Response, portfolio: Portfolio, meta: PageMeta, site: string, status = 200): Response {
  const setContent = (content: string) => ({
    element(el: Element) {
      el.setAttribute("content", content);
    },
  });

  const head = [
    // Relative on purpose: it must match the <img> URL on preview deployments and localhost too.
    `<link rel="preload" as="image" href="/media/${escapeHtml(portfolio.profile.portraitCutout)}" fetchpriority="high">`,
    meta.image ? `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">` : "",
    `<script type="application/ld+json">${inlineJson(personSchema(portfolio, site))}</script>`,
  ].join("");

  const rewritten = new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(meta.title);
      },
    })
    .on('meta[name="description"]', setContent(meta.description))
    .on('meta[property="og:title"]', setContent(meta.title))
    .on('meta[property="og:description"]', setContent(meta.description))
    .on('meta[property="og:url"]', setContent(meta.url))
    .on('meta[name="twitter:title"]', setContent(meta.title))
    .on('meta[name="twitter:description"]', setContent(meta.description))
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute("href", meta.url);
      },
    })
    .on('meta[property="og:image"], meta[name="twitter:image"]', {
      element(el) {
        if (meta.image) el.setAttribute("content", meta.image);
      },
    })
    .on("head", {
      element(el) {
        el.append(head, { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append(`<script id="portfolio-data" type="application/json">${inlineJson(portfolio)}</script>`, {
          html: true,
        });
      },
    })
    .transform(shell);

  const headers = new Headers(rewritten.headers);
  headers.delete("ETag");
  headers.delete("Content-Length");
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return new Response(rewritten.body, { status, headers });
}
