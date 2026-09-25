-- Honor label (e.g. Best Graduate) and a photo for education entries.
ALTER TABLE education ADD COLUMN honor TEXT;
ALTER TABLE education ADD COLUMN image_key TEXT;
ALTER TABLE education ADD COLUMN image_alt TEXT;
