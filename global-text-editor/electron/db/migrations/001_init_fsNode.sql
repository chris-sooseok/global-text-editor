CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    -- root: consider this later 
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE, -- nullable for top-level nodes
    name TEXT NOT NULL,
    storage_path TEXT UNIQUE, -- nullable for folder
    mime_type TEXT, -- nullable for folder and custom fileType
    file_type TEXT, -- nullable for folder
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: unique names under same dir including case
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_name_nocase
ON fsNode(COALESCE(parent_id, -1), name COLLATE NOCASE);

-- trigger that updates updated_at
CREATE TRIGGER IF NOT EXISTS trg_fsNode_updated_at
AFTER UPDATE ON fsNode
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE fsNode
  SET updated_at = strftime('%s','now')*1000
  WHERE id = OLD.id;
END;