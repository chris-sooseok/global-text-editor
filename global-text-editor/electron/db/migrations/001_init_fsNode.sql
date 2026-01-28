CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE, -- nullable for top-level nodes
    isRoot INTEGER NOT NULL CHECK (isRoot IN (0, 1)),
    name TEXT NOT NULL,
    storage_path TEXT UNIQUE, -- nullable for folder
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: unique names under same dir including case
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_name_nocase
ON fsNode(COALESCE(parent_id, -1), name COLLATE NOCASE);