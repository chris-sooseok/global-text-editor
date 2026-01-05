const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { getNextSortOrder } = require('./fileStorageHelper.cjs')

const db = connect_db()

ipcMain.handle('folders:create', (_event, payload) => {

  try{
    const name = payload.name
    const parentId = payload.parentId

    const now = Date.now()

    // Put new folder at the end among its siblings
    const nextSortOrder = getNextSortOrder(db, parentId)

    const info = db
      .prepare(`
        INSERT INTO folders (parent_id, name, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(parentId, name, nextSortOrder, now, now)

    return {
      ok: true,
      folder: {
        id: Number(info.lastInsertRowid),
        parentId,
        name,
        sortOrder: nextSortOrder,
        createdAt: now,
        updatedAt: now
      }
    }
  } catch (err) {
    console.error('[folders:created] failed:', err)
    return {ok: false, message: 'Failed to create folder'}
  }
})

// List folders (all, or by parentId if provided)
ipcMain.handle('folders:fetch', (_event, payload) => {
  try {
    const parentId = payload.parentId ?? null
    let rows

    // If parentId is not provided -> return all folders
    if (parentId === null) {
      // parentId === null -> only root-level folders (parent_id IS NULL)
      rows = db
        .prepare(`
          SELECT id, parent_id AS parentId, name,
                 sort_order AS sortOrder,
                 created_at AS createdAt, updated_at AS updatedAt
          FROM folders
          WHERE parent_id IS ?
          ORDER BY sort_order
        `)
        .all(parentId)
    } else {
    }

    return { ok: true, folders: rows }
  } catch (err) {
    console.error('[folders:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch folders' }
  }
})

ipcMain.handle('files:create', (_event, payload) => {
  try {
    const name = payload.name
    const parentId = payload.parentId ?? null
    const now = Date.now()

    const nextSortOrder = getNextSortOrder(db, parentId)

    const info = db
      .prepare(`
        INSERT INTO files (parent_id, name, storage_path, mime_type, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(parentId, name, '/', null, now, now, nextSortOrder)

      return {
        ok: true,
        file: {
          id: Number(info.lastInsertRowid),
          parentId,
          name,
          storage_path: '/',
          mime_type: null,
          createdAt: now,
          updatedAt: now,
          sortOrder: nextSortOrder
        }
      }
  } catch (err) {
    console.error('[files:created] failed:', err)
    return {ok: false, message: 'Failed to create file'}
  }

})

ipcMain.handle('files:fetch', (_event, payload) => {
  try {
    const parentId = payload.parentId ?? null
    let rows

    if (parentId === null) {
      rows = db
      .prepare(`
        SELECT id, parent_id AS parentId, name, storage_path AS storagePath, size_bytes AS sizeBytes, mime_type AS mimeType, created_at AS createdAt, updated_at AS updatedAt, sort_order AS sortOrder
        FROM files
        WHERE parent_id IS ?
        ORDER BY sort_order
      `)
      .all(parentId)
    }

    return { ok: true, files: rows}

  } catch (err) {
     console.error('[files:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch files' }
  }

})

ipcMain.handle('fsNode:fetch', (_event, _payload) => {
  try {
    rows = db
      .prepare(`
        SELECT id, type, parent_id AS parentId, name, storage_path AS storagePath, size_bytes AS sizeBytes, mime_type AS mimeType, created_at AS createdAt, updated_at AS updatedAt, sort_order AS sortOrder
        FROM fsNode
        -- sort ascending from root nodes to child nodes
        -- then sort by sort_order within each parent_id
        ORDER BY COALESCE(parent_id, -1), sort_order
        `)
        .all()

     return { ok: true, rows}

  } catch (err) {
    console.error('[fsNode:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch fsNode'}
  }
})