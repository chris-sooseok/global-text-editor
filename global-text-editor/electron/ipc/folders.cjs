const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')

ipcMain.handle('folders:create', (_evt, payload) => {
  try {
    const name = String(payload?.name ?? '').trim()

    // parentId: allow null for root, otherwise number
    const parentId =
      payload?.parentId === undefined || payload?.parentId === null
        ? null
        : Number(payload.parentId)

    if (!name) return { ok: false, message: 'Folder name is required.' }

    if (parentId !== null && Number.isNaN(parentId)) {
      return { ok: false, message: 'Invalid parent folder.' }
    }

    const now = Date.now()

    const info = connect_db()
      .prepare(`
        INSERT INTO folders (parent_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `)
      .run(parentId, name, now, now)

    return {
      ok: true,
      folder: { id: Number(info.lastInsertRowid), parentId, name, createdAt: now, updatedAt: now }
    }
  } catch (err) {
    // ...
    return { ok: false, message: 'Failed to create folder.' }
  }
})


// List folders (all, or by parentId if provided)
ipcMain.handle('folders:list', (_evt, payload) => {
  
  try {
    const db = connect_db()

    const parentId = payload?.parentId

    let rows

    // If parentId is not provided -> return all folders
    if (parentId === undefined) {
      rows = db
        .prepare(`
          SELECT id, parent_id AS parentId, name, created_at AS createdAt, updated_at AS updatedAt
          FROM folders
          ORDER BY parent_id IS NOT NULL, parent_id, name
        `)
        .all()
    } else if (parentId === null) {
      // parentId === null -> only root-level folders (parent_id IS NULL)
      rows = db
        .prepare(`
          SELECT id, parent_id AS parentId, name, created_at AS createdAt, updated_at AS updatedAt
          FROM folders
          WHERE parent_id IS NULL
          ORDER BY name
        `)
        .all()
    } else {
      // parentId is a number -> children of that parent
      const pid = Number(parentId)
      rows = db
        .prepare(`
          SELECT id, parent_id AS parentId, name, created_at AS createdAt, updated_at AS updatedAt
          FROM folders
          WHERE parent_id = ?
          ORDER BY name
        `)
        .all(pid)
    }

    return { ok: true, folders: rows }

  } catch (err) {
    console.error('[folders:list] failed:', err)
    return { ok: false, message: 'Failed to read folders.' }
  }
})
