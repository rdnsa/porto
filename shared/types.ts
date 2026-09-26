// Shape of the portfolio as served by /api/portfolio (and seeded from content/portfolio.json).
// Strings may contain **bold** markers, rendered by <Rich>. Image fields are R2 object keys.

export interface Profile {
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  tagline: string;
  intro: string;
  summary: string;
  location: string;
  email: string;
  availability: string;
  currentCompany: string;
  portrait: string;
  portraitCutout: string;
  aboutImage: string | null;
  aboutImageCaption: string | null;
  ogImage: string | null;
  resume: string | null;
}

export interface Social {
  label: string;
  handle: string;
  url: string;
}

export interface Stat {
  value: string;
  label: string;
  detail?: string | null;
}

export interface SkillGroup {
  title: string;
  kind: "core" | "tools";
  items: string[];
}

export interface Module {
  title: string;
  body: string;
}

export interface Flow {
  title: string;
  steps: string[];
}

export interface Story {
  title: string;
  challenge: string[];
  responsibilities: string[];
  initiatives: string[];
  impact: string[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string | null;
}

export interface Project {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  description: string;
  role: string;
  roleDetail: string;
  company: string | null;
  year: string | null;
  url: string | null;
  cover: string;
  coverAlt: string;
  theme: "light" | "dark";
  metrics: Stat[];
  modules: Module[];
  flows: Flow[];
  stories: Story[];
  gallery: GalleryImage[];
}

export interface Experience {
  company: string;
  companyNote: string | null;
  role: string;
  location: string;
  start: string;
  end: string;
  summary: string;
  points: string[];
}

export interface Education {
  school: string;
  degree: string;
  location: string;
  period: string;
  gpa: string;
  honor: string | null;
  image: string | null;
  imageAlt: string | null;
  points: string[];
}

export interface Organization {
  name: string;
  role: string;
  location: string;
  period: string;
  summary: string;
  points: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

/** A photo in the "Moments" gallery. */
export interface Moment {
  src: string;
  alt: string;
  caption: string | null;
}

export type Locale = "en" | "id";

/**
 * A partial copy of the portfolio in another language. Arrays line up with the English ones by
 * `slug`/`src` where items have one, otherwise by position; untranslated fields fall back to English.
 */
export type Translation = { [K in keyof Omit<Portfolio, "translations">]?: DeepPartial<Portfolio[K]> };

type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export interface Portfolio {
  profile: Profile;
  socials: Social[];
  stats: Stat[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  organizations: Organization[];
  certifications: Certification[];
  moments: Moment[];
  translations?: Partial<Record<Exclude<Locale, "en">, Translation>>;
}
