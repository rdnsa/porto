import type { Portfolio, Project, Translation } from "../shared/types";

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  SITE_URL: string;
}

type Row = Record<string, unknown>;

const text = (value: unknown) => (value === null || value === undefined ? "" : String(value));
const optional = (value: unknown) => (value === null || value === undefined || value === "" ? null : String(value));

function json<T>(value: unknown): T[] {
  try {
    const parsed: unknown = JSON.parse(text(value) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function toProject(row: Row): Project {
  return {
    slug: text(row.slug),
    name: text(row.name),
    category: text(row.category),
    tagline: text(row.tagline),
    summary: text(row.summary),
    description: text(row.description),
    role: text(row.role),
    roleDetail: text(row.role_detail),
    company: optional(row.company),
    year: optional(row.year),
    url: optional(row.url),
    cover: text(row.cover_key),
    coverAlt: text(row.cover_alt),
    coverFocus: row.cover_focus === "center" ? "center" : "start",
    theme: row.theme === "dark" ? "dark" : "light",
    metrics: json(row.metrics),
    modules: json(row.modules),
    flows: json(row.flows),
    stories: json(row.stories),
    gallery: json(row.gallery),
  };
}

/** Reads the whole portfolio in one D1 round trip. Returns null until the database is seeded. */
export async function loadPortfolio(db: D1Database): Promise<Portfolio | null> {
  const [profile, socials, stats, skills, projects, experience, education, organizations, certifications, moments, translations] =
    await db.batch<Row>([
      db.prepare("SELECT * FROM profile WHERE id = 1"),
      db.prepare("SELECT label, handle, url FROM socials ORDER BY sort, id"),
      db.prepare("SELECT value, label, detail FROM stats ORDER BY sort, id"),
      db.prepare("SELECT title, kind, items FROM skill_groups ORDER BY sort, id"),
      db.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY sort, slug"),
      db.prepare("SELECT * FROM experience ORDER BY sort, id"),
      db.prepare("SELECT * FROM education ORDER BY sort, id"),
      db.prepare("SELECT * FROM organizations ORDER BY sort, id"),
      db.prepare("SELECT title, issuer, year FROM certifications ORDER BY sort, id"),
      db.prepare("SELECT image_key, alt, caption FROM moments ORDER BY sort, id"),
      db.prepare("SELECT locale, data FROM translations"),
    ]);

  const p = profile.results[0];
  if (!p) return null;

  return {
    profile: {
      firstName: text(p.first_name),
      lastName: text(p.last_name),
      fullName: text(p.full_name),
      role: text(p.role),
      tagline: text(p.tagline),
      intro: text(p.intro),
      summary: text(p.summary),
      location: text(p.location),
      email: text(p.email),
      availability: text(p.availability),
      currentCompany: text(p.current_company),
      portrait: text(p.portrait_key),
      portraitCutout: text(p.portrait_cutout_key),
      aboutImage: optional(p.about_image_key),
      aboutImageCaption: optional(p.about_image_caption),
      ogImage: optional(p.og_image_key),
      resume: optional(p.resume_key),
    },
    socials: socials.results.map((r) => ({ label: text(r.label), handle: text(r.handle), url: text(r.url) })),
    stats: stats.results.map((r) => ({ value: text(r.value), label: text(r.label), detail: optional(r.detail) })),
    skills: skills.results.map((r) => ({
      title: text(r.title),
      kind: r.kind === "tools" ? "tools" : "core",
      items: json<string>(r.items),
    })),
    projects: projects.results.map(toProject),
    experience: experience.results.map((r) => ({
      company: text(r.company),
      companyNote: optional(r.company_note),
      role: text(r.role),
      location: text(r.location),
      start: text(r.start_date),
      end: text(r.end_date),
      summary: text(r.summary),
      points: json<string>(r.points),
    })),
    education: education.results.map((r) => ({
      school: text(r.school),
      degree: text(r.degree),
      location: text(r.location),
      period: text(r.period),
      gpa: text(r.gpa),
      honor: optional(r.honor),
      image: optional(r.image_key),
      imageAlt: optional(r.image_alt),
      points: json<string>(r.points),
    })),
    organizations: organizations.results.map((r) => ({
      name: text(r.name),
      role: text(r.role),
      location: text(r.location),
      period: text(r.period),
      summary: text(r.summary),
      points: json<string>(r.points),
    })),
    certifications: certifications.results.map((r) => ({
      title: text(r.title),
      issuer: text(r.issuer),
      year: text(r.year),
    })),
    moments: moments.results.map((r) => ({ src: text(r.image_key), alt: text(r.alt), caption: optional(r.caption) })),
    translations: Object.fromEntries(
      translations.results.flatMap((r) => {
        try {
          return [[text(r.locale), JSON.parse(text(r.data)) as Translation]];
        } catch {
          return [];
        }
      }),
    ),
  };
}
