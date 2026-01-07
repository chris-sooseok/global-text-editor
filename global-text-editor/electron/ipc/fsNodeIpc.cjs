const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { nextSortOrderHelper } = require('./fsNodeIpcHelper.cjs')
const { randomUUID } = require('node:crypto')

const db = connect_db()

ipcMain.handle('fsNodes:create', (_event, payload) => {

  if (payload.name.trim() == '') {
    return { ok: false, message: 'Name must be provided'}
  }

  try {
    const isRoot = payload.isRoot ? 1 : 0
    const type = payload.type
    const parentId = payload.parentId ?? null
    const name = payload.name
    let storagePath = null
    let sizeBytes = null
    let mimeType = null
    const now = Date.now()
    const nextSortOrder = nextSortOrderHelper(db, parentId)
    
    console.log(nextSortOrder)
    
    let info

    if (type === 'folder') {
      info = db
        .prepare(`
          INSERT INTO fsNode (is_root, type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
          VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?)
        `)
        .run(isRoot, type, parentId, name, now, now, nextSortOrder)
    } else if (type === 'file') {
      storagePath = randomUUID()
      sizeBytes = 0
      mimeType = null

      info = db
        .prepare(`
          INSERT INTO fsNode (is_root, type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(isRoot, type, parentId, name, storagePath, sizeBytes, mimeType, now, now, nextSortOrder)
    } else {
      return { ok: false, message: 'Invalid node type' }
    }

    return {
      ok: true,
      node: {
        id: Number(info.lastInsertRowid),
        isRoot,
        type,
        parentId,
        name,
        storagePath,
        sizeBytes,
        mimeType,
        createdAt: now,
        updatedAt: now,
        sortOrder: nextSortOrder,
      },
    }

  } catch (err) {
    console.error('[fsNodes:create] failed:', err)
    return { ok: false, message: 'Failed to create node' }
  } 
})

ipcMain.handle('fsNodes:delete', (_event, paylaod) => {

})

// fetch entire row of fsNodes to construct fsTree
ipcMain.handle('fsNodes:fetch', (_event, _payload) => {
  try {
    const rows = db
      .prepare(`
        SELECT 
          id,
          is_root AS isRoot,
          type, 
          parent_id AS parentId,
          name,
          storage_path AS storagePath,
          size_bytes AS sizeBytes,
          mime_type AS mimeType,
          created_at AS createdAt,
          updated_at AS updatedAt,
          sort_order AS sortOrder
        FROM fsNode
        -- sort ascending order
        -- sort based on sort_order within each parent group
        ORDER BY is_root, parent_id, sort_order
        `)
        .all()

     return { ok: true, rows}

  } catch (err) {
    console.error('[fsNode:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch fsNode'}
  }
})