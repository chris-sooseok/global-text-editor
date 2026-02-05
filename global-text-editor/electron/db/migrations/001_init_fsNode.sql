CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    -- nodes under seed node are root nodes
    is_root INTEGER NOT NULL CHECK (is_root IN (0, 1)),
    -- nullable for seed node
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: ensure unique name under same parent
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_name_nocase
ON fsNode(COALESCE(parent_id, -1), name COLLATE NOCASE);

-- enforce: ensure file node has unique storage path
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_file_storage_path
ON fsNode(storage_path)
WHERE type = 'file';

-- seed: create seed node (id=0)
INSERT OR IGNORE INTO fsNode
  (id, uuid, type, parent_id, is_root, name, storage_path, created_at, updated_at, sort_order)
VALUES
  (
    0,
    '00000000-0000-0000-0000-000000000000',
    'folder',
    NULL,
    1,
    'root',
    '',
    (CAST(strftime('%s','now') AS INTEGER) * 1000),
    (CAST(strftime('%s','now') AS INTEGER) * 1000),
    0
  );

-- enforce: protect seed node from deletion
CREATE TRIGGER IF NOT EXISTS fsNode_no_delete_root
BEFORE DELETE ON fsNode
FOR EACH ROW
WHEN OLD.id = 0
BEGIN
  SELECT RAISE(ABORT, 'Cannot delete root node');
END;
-- enforce: protect seed node from update
CREATE TRIGGER IF NOT EXISTS fsNode_no_update_root
BEFORE UPDATE ON fsNode
FOR EACH ROW
WHEN OLD.id = 0
BEGIN
  SELECT RAISE(ABORT, 'Cannot modify root node');
END;