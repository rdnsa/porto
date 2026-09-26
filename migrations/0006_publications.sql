-- Published research (mirrors the Google Scholar profile).
CREATE TABLE publications (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(authors)),
  venue TEXT NOT NULL,
  details TEXT,
  year TEXT NOT NULL,
  url TEXT NOT NULL,
  pdf_url TEXT,
  citations INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);
