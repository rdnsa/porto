-- Which part of the cover a project card shows: the top-left corner (dashboards) or the centre (heroes, photos).
ALTER TABLE projects ADD COLUMN cover_focus TEXT NOT NULL DEFAULT 'start' CHECK (cover_focus IN ('start', 'center'));
