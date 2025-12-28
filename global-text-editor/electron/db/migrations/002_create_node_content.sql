-- File contents kept separate (cleaner than mixing into nodes)
CREATE TABLE IF NOT EXISTS file_contents (
  node_id INTEGER PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT ''
);

-- root folder (one-time). name '' means "root"
INSERT OR IGNORE INTO nodes (id, parent_id, name, kind)
VALUES (1, NULL, '', 'folder');