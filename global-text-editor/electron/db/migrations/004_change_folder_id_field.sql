PRAGMA foreign_keys = OFF;

-- Create new table with parent_id (nullable) instead of folder_id
CREATE TABLE IF NOT EXISTS files_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE, -- nullable
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(parent_id, name)
);

-- Copy data from old table (folder_id -> parent_id)
INSERT INTO files_new (
  id, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order
)
SELECT
  id, folder_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order
FROM files;

DROP TABLE files;
ALTER TABLE files_new RENAME TO files;

CREATE INDEX IF NOT EXISTS idx_files_parent_sort
ON files(parent_id, sort_order);

PRAGMA foreign_keys = ON;
