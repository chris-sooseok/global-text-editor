CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE, -- nullable for root node
    isRoot INTEGER NOT NULL CHECK (isRoot IN (0, 1)),
    name TEXT NOT NULL,
    storage_path TEXT UNIQUE, -- nullable for folder
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: unique names under same dir including case
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_name_nocase
ON fsNode(COALESCE(parent_id, -1), name COLLATE NOCASE);

-- create the always-present head/root node (id=0)
INSERT OR IGNORE INTO fsNode
  (id, uuid, type, parent_id, isRoot, name, storage_path, created_at, updated_at, sort_order)
VALUES
  (
    0,
    '00000000-0000-0000-0000-000000000000',
    'folder',
    NULL,
    1,
    'root',
    NULL,
    (CAST(strftime('%s','now') AS INTEGER) * 1000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000),
    0
  );

-- protect seed node
CREATE TRIGGER IF NOT EXISTS fsNode_no_delete_root
BEFORE DELETE ON fsNode
FOR EACH ROW
WHEN OLD.id = 0
BEGIN
  SELECT RAISE(ABORT, 'Cannot delete root node');
END;

CREATE TRIGGER IF NOT EXISTS fsNode_no_update_root
BEFORE UPDATE ON fsNode
FOR EACH ROW
WHEN OLD.id = 0
BEGIN
  SELECT RAISE(ABORT, 'Cannot modify root node');
END;