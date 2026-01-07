CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_root BOOLEAN NOT NULL
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE, -- nullable for roots
    name TEXT NOT NULL,
    storage_path TEXT, -- nullable for folder
    size_bytes INTEGER, -- nullable for folder
    mime_type TEXT, -- nullable for folder
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    CHECK (
        -- folder restrictions
        (type = 'folder' AND storage_path IS NULL AND size_bytes IS NULL AND mime_type IS NULL)
        OR 
        -- file restrictions
        --! need to include mime-type later
        (type = 'file' AND storage_path IS NOT NULL AND size_bytes >= 0)
    )
);


CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: every fsNode file storage_path must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_storage_path_for_files
ON fsNode(storage_path)
WHERE type = 'file';

-- enforce: every fsNode siblings must have unique sort_order
CREATE UNIQUE INDEX IF NOT EXISTS idx_fsNode_unique_sibling_sort_order
  -- COALESCE allows parend_id null values to be treated as -1 since sql doesn't regard null as a value
  -- enforce: within the same parent directory, sort_order must be unique
ON fsNode(COALESCE(parent_id, -1), sort_order); 

-- enforce: any fsNode's parent must be a folder when insert
CREATE TRIGGER IF NOT EXISTS trg_fsNode_parent_must_be_folder_insert
BEFORE INSERT ON fsNode
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE
    -- check if inserted parent has 'folder' type
    WHEN (SELECT type FROM fsNode WHERE id = NEW.parent_id) <> 'folder'
    THEN RAISE(ABORT, 'parent must be a folder')
  END;
END;

-- enforce: any fsNode's parent must be a folder when update
CREATE TRIGGER IF NOT EXISTS trg_fsNode_parent_must_be_folder_update
BEFORE UPDATE OF parent_id ON fsNode
FOR EACH ROW
WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE
    -- when if new parent has 'folder' type
    WHEN (SELECT type FROM fsNode WHERE id = NEW.parent_id) <> 'folder'
    THEN RAISE(ABORT, 'parent must be a folder')
  END;
END;

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