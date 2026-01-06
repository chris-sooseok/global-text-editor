const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { getNextSortOrder } = require('./fsNodeIpcHelper.cjs')
const { randomUUID } = require('node:crypto')

const db = connect_db()

ipcMain.handle('fsNodes:create', (_event, payload) => {
  try {
    const type = payload.type
    const parentId = payload.parentId ?? null
    const name = payload.name
    let storagePath = null
    let sizeBytes = null
    let mimeType = null
    const now = Date.now()
    const nextSortOrder = getNextSortOrder(db, parentId)
    
    let info

    if (type === 'folder') {
      info = db
        .prepare(`
          INSERT INTO fsNode (type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
          VALUES ('folder', ?, ?, NULL, NULL, NULL, ?, ?, ?)
        `)
        .run(parentId, name, now, now, nextSortOrder)
    } else if (type === 'file') {
      storagePath = randomUUID()
      sizeBytes = 0
      mimeType = null

      info = db
        .prepare(`
          INSERT INTO fsNode (type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
          VALUES ('file', ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(parentId, name, storagePath, sizeBytes, mimeType, now, now, nextSortOrder)
    } else {
      return { ok: false, message: 'Invalid node type' }
    }

    return {
      ok: true,
      node: {
        id: Number(info.lastInsertRowid),
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


// fetch entire row of fsNodes to construct fsTree
ipcMain.handle('fsNodes:fetch', (_event, _payload) => {
  try {
    const rows = db
      .prepare(`
        SELECT 
          id,
          type, parent_id AS parentId,
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
        ORDER BY COALESCE(parent_id, -1), sort_order
        `)
        .all()

     return { ok: true, rows}

  } catch (err) {
    console.error('[fsNode:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch fsNode'}
  }
})