-- "Moments" photo gallery.
CREATE TABLE moments (
  id INTEGER PRIMARY KEY,
  image_key TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
