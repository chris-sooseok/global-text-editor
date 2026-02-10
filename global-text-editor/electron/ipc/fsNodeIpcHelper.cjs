const { connect_db } = require('../db/index.cjs')

const db = connect_db()

/**
 * Decides which sortOrder next node should get under some parentId
 * If no node exists yet, start with sort_order = 1
 */
function getNextSortOrder(parentId) {
  const row = db
    .prepare(`
      SELECT MAX(sort_order) AS maxOrder
      FROM fsNode
      WHERE parent_id IS ?
    `)
    .get(parentId)

  return (Number(row?.maxOrder) || 0) + 1
}

// reorder siblings of a deleting node
function reorderSiblings(parentId) {
  const siblings = db
    .prepare(`
      SELECT id
      FROM fsNode
      WHERE parent_id IS ?
      ORDER BY sort_order, id
    `)
    .all(parentId)

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


module.exports = {
  getNextSortOrder,
  reorderSiblings,
  valididateName,
  validateType,
}




