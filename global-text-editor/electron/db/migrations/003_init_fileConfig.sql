
-- assits persisting file config
CREATE TABLE IF NOT EXISTS fileConfig (
  file_id INTEGER PRIMARY KEY,
  editor_theme TEXT NOT NULL CHECK (editor_theme IN ('black', 'white')),
  FOREIGN KEY (file_id) REFERENCES fsNode(id) ON DELETE CASCADE
);