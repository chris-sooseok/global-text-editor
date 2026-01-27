
const validFileTypes = ['normal', 'markdown', 'canvas', 'page', 'diagram']

function getNextSortOrder(db, parentId) {
  const row = db
    .prepare(`
      SELECT MAX(sort_order) AS maxOrder
      FROM fsNode
      WHERE parent_id IS ?
    `)
    .get(parentId ?? null)

  return (Number(row?.maxOrder) || 0) + 1
}

// reorder siblings of a deleting node
function reorderSiblings(db, parentId) {
  const siblings = db
    .prepare(`
      SELECT id
      FROM fsNode
      WHERE parent_id IS ?
      ORDER BY sort_order, id
    `)
    .all(parentId ?? null)

  const prepUpdate = db.prepare(`
    UPDATE fsNode
    SET sort_order = ?
    WHERE id = ?
  `)

  for (let i = 0; i < siblings.length; i++) {
    prepUpdate.run(i + 1, siblings[i].id)
  }
}

// name must be shorter than or equal to 50 chars
function valididateName(name) {
  if (name.trim() === "") return false
  if (name.length > 50) return false
  return true
}

// folder or file is only allowed
function validateType(type) {
  return type === "folder" || type === "file"
}

// file must have valid file type
function validateFile(type, fileType) {
  if (type === 'file' && !validFileTypes.includes(fileType)) false
  return true
}

// folder must not have any mimeType or fileType
function validateFolder(type, mimeType, fileType) {
  if (type === "folder" && (!mimeType || !fileType)) false
  return true 
}


module.exports = {
  getNextSortOrder,
  reorderSiblings,
  valididateName,
  validateType,
  validateFolder,
  validateFile,
}




