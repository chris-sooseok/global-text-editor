
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


module.exports = { getNextSortOrder }