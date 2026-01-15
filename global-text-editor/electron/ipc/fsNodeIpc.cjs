const { ipcMain, app } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { getNextSortOrder } = require('./fsNodeIpcHelper.cjs')

const db = connect_db()

ipcMain.handle('fsNodes:create', (_event, payload) => {

  if (payload.name.trim() == '') {
    return { ok: false, message: 'Name must be provided'}
  }

  try {
    const type = payload.type
    const parentId = payload.parentId ?? null
    const name = payload.name
    let mimeType = payload.mimeType ?? null
    let storagePath = null
    const now = Date.now()
    const nextSortOrder = getNextSortOrder(db, parentId)
    let info


    info = db
    .prepare(`
      INSERT INTO fsNode (type, parent_id, name, storage_path, mime_type, created_at, updated_at, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(type, parentId, name, storagePath, mimeType, now, now, nextSortOrder)

    return {
      ok: true,
      node: {
        id: Number(info.lastInsertRowid),
        type,
        parentId,
        name,
        storagePath,
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

ipcMain.handle('fsNodes:delete', (_event, payload) => {

  const id = payload.id
  const type = payload.type
  try {
    if (type === 'file') {

    }

    info = db.prepare(`DELETE FROM fsNode WHERE id = ?`).run(id)

    return {ok: true}
    
  } catch (err) {
    return {ok: false}
  }
})

// fetch entire row of fsNodes to construct fsTree
ipcMain.handle('fsNodes:fetch', (_event, _payload) => {
  try {
    const rows = db
      .prepare(`
        SELECT 
          id,
          type, 
          parent_id AS parentId,
          name,
          storage_path AS storagePath,
          mime_type AS mimeType,
          created_at AS createdAt,
          updated_at AS updatedAt,
          sort_order AS sortOrder
        FROM fsNode
        -- sort ascending order
        -- sort based on sort_order within each parent group
        ORDER BY parent_id, sort_order
        `)
        .all()

     return { ok: true, rows}

  } catch (err) {
    console.error('[fsNode:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch fsNode'}
  }
})