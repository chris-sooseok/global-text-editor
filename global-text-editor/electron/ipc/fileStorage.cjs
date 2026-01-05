const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { getNextSortOrder } = require('./fileStorageHelper.cjs')
const { randomUUID } = require('node:crypto')

const db = connect_db()

ipcMain.handle('folders:create', (_event, payload) => {
  try {
    const name = payload.name
    const parentId = payload.parentId ?? null
    const now = Date.now()

    const nextSortOrder = getNextSortOrder(db, parentId)

    const info = db
      .prepare(`
        INSERT INTO fsNode (type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
        VALUES ('folder', ?, ?, NULL, NULL, NULL, ?, ?, ?)
      `)
      .run(parentId, name, now, now, nextSortOrder)

    return {
      ok: true,
      node: {
        id: Number(info.lastInsertRowid),
        type: 'folder',
        parentId,
        name,
        storagePath: null,
        sizeBytes: null,
        mimeType: null,
        createdAt: now,
        updatedAt: now,
        sortOrder: nextSortOrder,
      },
    }
  }catch (err) {
    console.error('[folders:create] failed:', err)
    return { ok: false, message: 'Failed to create folder' }
  }
})


ipcMain.handle('files:create', (_event, payload) => {
  try {
    const name = payload.name
    const parentId = payload.parentId ?? null
    const now = Date.now()

    const nextSortOrder = getNextSortOrder(db, parentId)

    // Unique blob key (you’ll store the physical file at <storageRoot>/<storagePath>)
    const storagePath = randomUUID()

    // Until you write the file bytes, 0 is fine (must be NOT NULL and >= 0)
    const sizeBytes = 0
    const mimeType = null

    const info = db
      .prepare(`
        INSERT INTO fsNode (type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
        VALUES ('file', ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(parentId, name, storagePath, sizeBytes, mimeType, now, now, nextSortOrder)

    return {
      ok: true,
      node: {
        id: Number(info.lastInsertRowid),
        type: 'file',
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
    console.error('[files:create] failed:', err)
    return { ok: false, message: 'Failed to create file' }
  }
})


ipcMain.handle('fsNodes:fetch', (_event, _payload) => {
  try {
    const rows = db
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