const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')
const { randomUUID } = require("node:crypto")
const path = require("node:path")
const fs = require("node:fs")

const {
  getNextSortOrder,
  valididateName,
  validateType,
  validateFolder,
  validateFile,
} = require("./fsNodeIpcHelper.cjs")


const db = connect_db()

ipcMain.handle('fsNodes:create', (_event, payload) => {

  // folder&file
  const uuid = randomUUID()
  const type = payload.type
  const name = payload.name  
  const parentId = payload.parentId ?? null
  const now = Date.now()
  const nextSortOrder = getNextSortOrder(db, parentId)
  // file
  const mimeType = payload.mimeType ?? null
  const fileType = payload.fileType ?? null
  let storagePath
  let absStoragePath

  if (!valididateName(name)) return { ok: false, message: 'Name is invalid'}
  if (!validateType(type)) return { ok: false, message: "Type is invalid"}
  if (!validateFile(type, fileType)) return { ok: false, message: "Invalid file"}
  if (!validateFolder(type, mimeType, fileType)) return { ok: false, message: "Invalid folder"}
  
  if (type === 'file') {
    storagePath = `nodes/${uuid}`
    absStoragePath = path.join(app.getPath("userData"), storagePath)
    fs.mkdirSync(absStoragePath, { recursive: true})
  }

  try {
    const info = db
      .prepare(`
        INSERT INTO fsNode (uuid, type, parent_id, name, storage_path, mime_type, file_type, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(uuid, type, parentId, name, storagePath, mimeType, fileType, now, now, nextSortOrder)

      return {
        ok: true,
        row: {
          id: Number(info.lastInsertRowid),
          uuid,
          type,
          parentId,
          name,
          createdAt: now,
          storagePath,
          mimeType,
          fileType,
          sortOrder: nextSortOrder
        },
      }

  } catch (err) {
    if (type === "file" && absStoragePath) {
      fs.rmSync(absStoragePath, { recursive: true, force: true })
    }
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
          uuid,
          type, 
          parent_id AS parentId,
          name,
          storage_path AS storagePath,
          mime_type AS mimeType,
          file_type AS fileType,
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


ipcMain.handle('editor:save', (_event, payload) => {

  const id = payload.id
  const editorData = payload.editorData

  const row = db.prepare(`SELECT storage_path FROM fsNode WHERE id = ?`).get(id)
  const dirPath = path.join(app.getPath("userData"), row.storage_path)
  fs.writeFileSync(path.join(dirPath, "normal.json"), editorData, "utf8")

})