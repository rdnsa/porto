-- Portfolio content. List-shaped columns hold JSON arrays; image columns hold R2 object keys
-- (served by the Pages Function at /media/<key>).

CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  tagline TEXT NOT NULL,
  intro TEXT NOT NULL,
  summary TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT NOT NULL,
  current_company TEXT NOT NULL,
  portrait_key TEXT NOT NULL,
  portrait_cutout_key TEXT NOT NULL,
  about_image_key TEXT,
  about_image_caption TEXT,
  og_image_key TEXT,
  resume_key TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE socials (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  handle TEXT NOT NULL,
  url TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stats (
  id INTEGER PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE skill_groups (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'core' CHECK (kind IN ('core', 'tools')),
  items TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(items)),
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE projects (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  role TEXT NOT NULL,
  role_detail TEXT NOT NULL,
  company TEXT,
  year TEXT,
  url TEXT,
  cover_key TEXT NOT NULL,
  cover_alt TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  metrics TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(metrics)),
  modules TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(modules)),
  flows TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(flows)),
  stories TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(stories)),
  gallery TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(gallery)),
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experience (
  id INTEGER PRIMARY KEY,
  company TEXT NOT NULL,
  company_note TEXT,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  summary TEXT NOT NULL,
  points TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(points)),
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE education (
  id INTEGER PRIMARY KEY,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  location TEXT NOT NULL,
  period TEXT NOT NULL,
  gpa TEXT NOT NULL,
  points TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(points)),
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE organizations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  period TEXT NOT NULL,
  summary TEXT NOT NULL,
  points TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(points)),
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE certifications (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

-- Contact form submissions. ip_hash is a SHA-256 of the IP with a daily salt, used only to rate-limit.
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_hash TEXT,
  country TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_ip_hash_created_at ON messages (ip_hash, created_at);
