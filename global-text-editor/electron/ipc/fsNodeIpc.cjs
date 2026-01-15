const { ipcMain, app } = require('electron')
const { connect_db } = require('../db/index.cjs')
const { getNextSortOrder } = require('./fsNodeIpcHelper.cjs')
const path = require('node:path')
const fs = require('node:fs')

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
    let sizeBytes = null
    let mimeType = null

    let storagePath = null
    let absPath = null
    let createdOnDisk = false

    const now = Date.now()
    const nextSortOrder = getNextSortOrder(db, parentId)
    let info

    let parentStoragePath = 'dir'

    if (parentId !== null) {
      const parent = db
        .prepare(`SELECT id, type, storage_path FROM fsNode WHERE id = ?`)
        .get(parentId)

      parentStoragePath = parent.storage_path
    }

    storagePath = path.posix.join(parentStoragePath, name)


    absPath = path.join(app.getPath('userData'), ...storagePath.split('/'))

    fs.mkdirSync(path.dirname(absPath), { recursive: true})

    if (type ==='file') {
      mimeType = payload.mimeType
      sizeBytes = 0

      fs.writeFileSync(absPath, '', {flag: 'wx'})
      createdOnDisk = true
    }

    if (type === 'folder') {
      fs.mkdirSync(absPath)
      createdOnDisk = true
    }

    info = db
    .prepare(`
      INSERT INTO fsNode (is_root, type, parent_id, name, storage_path, size_bytes, mime_type, created_at, updated_at, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(isRoot, type, parentId, name, storagePath, sizeBytes, mimeType, now, now, nextSortOrder)

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

    // best-effort cleanup if we already created something on disk
    try {
      if (createdOnDisk && absPath) {
        fs.rmSync(absPath, { recursive: true, force: true })
      }
    } catch (_) {
      // ignore cleanup failure
    }

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