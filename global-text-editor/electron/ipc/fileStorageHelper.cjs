
function getNextSortOrder(db, parentId) {
  // parentId can be null (root) or a number (folder id)
  const row = db.prepare(`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextSortOrder
    FROM (
      SELECT sort_order FROM folders WHERE parent_id IS ?
      UNION ALL
      SELECT sort_order FROM files   WHERE parent_id IS ?
    )
  `).get(parentId, parentId)

  return row.nextSortOrder
}

module.exports = { getNextSortOrder }