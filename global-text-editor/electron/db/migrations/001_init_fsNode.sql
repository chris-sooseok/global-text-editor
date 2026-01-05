CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT,
    size_bytes INTEGER,
    mime_type TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    CHECK (
        (type = 'folder' AND storage_path IS NULL AND mime_type IS NULL AND size_bytes is NULL)
        OR 
        (type = 'file' AND storage_path IS NOT NULL AND size_bytes IS NOT NULL AND size_bytes >= 0)
    )
);


CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: every fsNode storage_path must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_storage_path_for_files
ON fsNode(storage_path)
WHERE type = 'file';


-- enforce: every fsNode under same directory must have unique sort_order
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_sort_order
ON fsNode(COALESCE(parent_id, -1), sort_order);


-- enforce: any fsNode's parent must be a folder
CREATE TRIGGER IF NOT EXISTS trg_fsNode_parent_must_be_folder_insert
BEFORE INSERT ON fsNode
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE
    WHEN (SELECT type FROM fsNode WHERE id = NEW.parent_id) <> 'folder'
    THEN RAISE(ABORT, 'parent must be a folder')
  END;
END;

CREATE TRIGGER IF NOT EXISTS trg_fsNode_parent_must_be_folder_update
BEFORE UPDATE OF parent_id ON fsNode
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE
    WHEN (SELECT type FROM fsNode WHERE id = NEW.parent_id) <> 'folder'
    THEN RAISE(ABORT, 'parent must be a folder')
  END;
END;

-- trigger that updates updated_at of updated folders
CREATE TRIGGER IF NOT EXISTS trg_folders_updated_at
AFTER UPDATE ON folders
FOR EACH ROW
BEGIN
  UPDATE folders
  SET updated_at = strftime('%s','now')*1000
  WHERE id = OLD.id;
END;

-/ trigger that updates updated_at of updated files
CREATE TRIGGER IF NOT EXISTS trg_files_updated_at
AFTER UPDATE ON files
FOR EACH ROW
BEGIN
  UPDATE files
  SET updated_at = strftime('%s','now')*1000
  WHERE id = OLD.id;
END;