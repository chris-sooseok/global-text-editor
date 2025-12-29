const { ipcMain, app } = require('electron')
const { get_db } = require('../db/index.cjs')

ipcMain.handle('folders:create', (_evt, payload) => {
  try {
    const name = String(payload?.name ?? '').trim()
    const parentId = Number(payload?.parentId ?? 1)

    if (!name) {
      return { ok: false, message: 'Folder name is required.' }
    }

    const now = Date.now()

    const info = get_db()
      .prepare(`
        INSERT INTO folders (parent_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `)
      .run(parentId, name, now, now)

    return {
      ok: true,
      folder: {
        id: Number(info.lastInsertRowid),
        parentId,
        name,
        createdAt: now,
        updatedAt: now
      }
    }
  } catch (err) {
    if (!app.isPackaged) console.error('[folders:create] failed:', err)

    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { ok: false, message: 'A folder with that name already exists here.' }
    }

    return { ok: false, message: 'Failed to create folder.' }
  }
})

