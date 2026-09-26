-- One row per non-English locale: a partial portfolio (same shape as /api/portfolio) laid over the English content.
CREATE TABLE translations (
  locale TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
