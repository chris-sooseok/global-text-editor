-- Add ordering for drag & drop

ALTER TABLE folders ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE files   ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Fast sibling ordering lookups
CREATE INDEX IF NOT EXISTS idx_folders_parent_sort
ON folders(parent_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_files_folder_sort
ON files(folder_id, sort_order);
