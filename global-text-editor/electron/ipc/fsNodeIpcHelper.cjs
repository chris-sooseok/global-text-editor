
function getNextSortOrder(db, parentId) {
  // MAX(sort_order) among siblings; if none, start at 0
  const row = db
    .prepare(`
      SELECT MAX(sort_order) AS maxSort
      FROM fsNode
      WHERE parent_id IS ?
    `)
    .get(parentId ?? null)

  return Number(row.maxSort) + 1
}


function sanitizeFilename(name) {

  // Prevent path traversal + illegal filename characters across OSes
  // Keep it simple: replace slashes and other bad chars with "_"
  return name.replace(/[\\/:"*?<>|\u0000-\u001F]/g, '_')
}

module.exports = { getNextSortOrder, sanitizeFilename }