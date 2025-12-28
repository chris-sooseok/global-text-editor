-- One table for both folders and files
CREATE TABLE nodes (
  id         INTEGER PRIMARY KEY,
  parent_id  INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('folder', 'file')),

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- optional: ordering in a folder
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- prevent two siblings from having the same name
  UNIQUE(parent_id, name)
);

-- Fast "list children" queries
CREATE INDEX IF NOT EXISTS idx_nodes_parent ON nodes(parent_id);
