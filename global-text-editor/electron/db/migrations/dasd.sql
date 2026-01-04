

CREATE TABLE IF NOT EXISTS fsNode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('folder', 'file')),
    parent_id INTEGER REFERENCES fsNode(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT,
    size_bytes INTEGER DEFAULT 0,
    mime_type TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    CHECK (
        (type = 'folder' AND storage_path IS NULL AND mime_type IS NULL AND size_bytes is NULL)
        OR 
        (type = 'file' AND storage_path IS NOT NULL AND size_bytes IS NOT NULL)
    )
);


CREATE INDEX IF NOT EXISTS idx_fsNode_parent_id ON fsNode(parent_id);

-- enforce: parent must be a folder
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