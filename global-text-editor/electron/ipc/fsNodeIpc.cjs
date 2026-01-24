const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')
const { randomUUID } = require("node:crypto")
const path = require("node:path")
const fs = require("node:fs")

const {
  getNextSortOrder,
  reorderSiblings,
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
  let info
  if (!valididateName(name)) return { ok: false, message: 'Name is invalid'}
  if (!validateType(type)) return { ok: false, message: "Type is invalid"}
  if (!validateFile(type, fileType)) return { ok: false, message: "Invalid file"}
  if (!validateFolder(type, mimeType, fileType)) return { ok: false, message: "Invalid folder"}
  
  /** if file
   * 1. store file in db
   * 2. create file config
   * 3. create disk path
   * 
   * if folder
   * 1. simply store folder in db
   */

  const tsx = db.transaction(() => {
    info = db
      .prepare(`
        INSERT INTO fsNode (uuid, type, parent_id, name, storage_path, mime_type, file_type, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(uuid, type, parentId, name, storagePath, mimeType, fileType, now, now, nextSortOrder)
    const id = Number(info.lastInsertRowid)
    if (type === "file") {
      db.prepare(`
        INSERT INTO fileConfig (file_id, toolbar_is_visible, editor_theme)
        VALUES (?, ?, ?)
      `).run(id, 0, "black")

      storagePath = `nodes/${uuid}`
      absStoragePath = path.join(app.getPath("userData"), storagePath)
      fs.mkdirSync(absStoragePath, { recursive: true})
    }

  })
  try {
    tsx()
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

ipcMain.handle("fsNodes:rename", (_event, payload) => {
  const id = payload.id
  const newName = payload.newName
  if (!valididateName(newName)) return { ok: false }
  db.prepare(`
    UPDATE fsNode
    SET name = ?
    WHERE id = ?
  `).run(newName, id)
  return { ok: true }
})

ipcMain.handle("fsNodes:remove", (_event, payload) => {
  const removeNode = payload.removeNode
  const parentId = removeNode.parentId
  const type = removeNode.type
  const id = removeNode.id

  const tsx = db.transaction(() => {
    /** if file
     * 1. simply delete it from db
     * 2. delete disk files
     * 3. reorder siblings
     */
    if (type === "file") {
      db.prepare(`DELETE FROM fsNode WHERE id = ?`).run(id)
      const abs = path.join(app.getPath("userData"), removeNode.storagePath)
      fs.rmSync(abs, { recursive: true, force: true })
      reorderSiblings(db, parentId)
      return
    }

    /** if folder
     * 1. get storage path of all its child
     * 2. cascade delete all children
     * 3. delete disk files of all children
     * 4. reorder siblings
     */
    const storageRows = db
      .prepare(`
        WITH RECURSIVE subtree(id) AS (
          SELECT id FROM fsNode WHERE id = ?
          UNION ALL
          SELECT f.id
          FROM fsNode f
          JOIN subtree s ON f.parent_id = s.id
        )
        SELECT storage_path AS storagePath
        FROM fsNode
        WHERE id IN (SELECT id FROM subtree)
          AND storage_path IS NOT NULL
      `)
      .all(id)
    db.prepare(`DELETE FROM fsNode WHERE id = ?`).run(id)
    for (const r of storageRows) {
      const abs = path.join(app.getPath("userData"), r.storagePath)
      fs.rmSync(abs, { recursive: true, force: true })
    }
    reorderSiblings(db, parentId)
  })

  try {
    tsx()
    return { ok: true }
  } catch (err) {
    console.error("[fsNodes:remove] failed:", err)
    return { ok: false }
  }
})

/**
 * whether it is a folder or file, if newParentId is same
 * we simply need to update sortOrder
 */
ipcMain.handle("fsNodes.updateOrder", (_evnet, payload) => {

})

/**
 * whether it is a file or folder, if 
 * targetNode
 * newParentId
 */
ipcMain.handle("fsNodes:move", (_event, payload) => {

  const node = payload.node
  const targetNode = payload.targetNode
  const newParentId = payload.newParentId
  const dropPosition = payload.dropPosition

  // case 2: moving into folder that the node doesn't belong to
  // case 5: if file is moved into lower-level folder
  if (targetNode.type === 'folder' && dropPosition === 'inside' && node.parentId !== newParentId) {

    // case 3: folder cannot be moved into its own descendant
    if (node.type === "folder") {
      const hit = db.prepare(`
        WITH RECURSIVE subtree(id) AS (
          SELECT id FROM fsNode WHERE id = ?
          UNION ALL
          SELECT f.id
          FROM fsNode f
          JOIN subtree s ON f.parent_id = s.id
        )
        SELECT 1 AS hit
        FROM subtree
        WHERE id = ?
        LIMIT 1
      `).get(node.id, newParentId)

      if (hit) return { ok: false }
    }
    const nextSortOrder = getNextSortOrder(db, newParentId)
    const oldParentId = node.parentId

    const tsx = db.transaction(() => {
      db.prepare(`
        UPDATE fsNode
        SET parent_id = ?, sort_order = ?
        WHERE id = ?
      `).run(newParentId, nextSortOrder, node.id)

      reorderSiblings(db, oldParentId)
    })
    try {
      tsx()
      return {ok: true}
    } catch (err) {
      console.error("[fsNodes:move] failed:", err)
      return {ok: false}
    }
  }

  // case 6: moved into same parent, but order is changed
  if (node.parentId === newParentId && targetNode.parentId === newParentId &&
     (dropPosition === "before" || dropPosition === "after")) {
    const parentid = newParentId
    const siblingIds = db.prepare(`
      SELECT id
      FROM fsNode
      WHERE parent_id IS ?
      ORDER BY sort_order, id
    `).all(parentid).map(r => r.id)

    const filtered = siblingIds.filter(id => id !== node.id)
    const targetIdx = filtered.indexOf(targetNode.id)

    const insertIdx = dropPosition === "before" ? targetIdx : targetIdx + 1
    // insert node into filtered list
    filtered.splice(insertIdx, 0, node.id)

    const tsx = db.transaction(() => {
      const prepUpdate = db.prepare(`
        UPDATE fsNode
        SET sort_order = ?
        WHERE id = ?
      `)

      // simple 1..N
      for (let i = 0; i < filtered.length; i++) {
        prepUpdate.run(i + 1, filtered[i])
      }
    })

    try {
      tsx()
      return { ok: true}
    } catch (err) {
      console.error("[fsNodes:move] failed:", err)
      return {ok: false}
    }
    
  }

  // case 7: moved into differnt parent, and dropPosition is also specified
  if (node.parentId !== newParentId && targetNode.parentId === newParentId 
    && (dropPosition === "before" || dropPosition === "after")) {

    const oldParentId = node.parentId
    const parentId = newParentId

    const tsx = db.transaction(() => {
      // move parent first
      db.prepare(`
        UPDATE fsNode
        SET parent_id = ?
        WHERE id = ?
      `).run(parentId, node.id)

      let siblingIds = db.prepare(`
        SELECT id
        FROM fsNode
        WHERE parent_id IS ?
        ORDER BY sort_order, id
      `).all(parentId).map(r => r.id)


      const filtered = siblingIds.filter(id => id !== node.id)
      const targetIdx = filtered.indexOf(targetNode.id)
      const insertIdx = dropPosition === "before" ? targetIdx : targetIdx + 1
      // insert node into filtered list
      filtered.splice(insertIdx, 0, node.id)

      const prepUpdate = db.prepare(`
        UPDATE fsNode
        SET sort_order = ?
        WHERE id = ?
      `)

      for (let i = 0; i < filtered.length; i++) {
        prepUpdate.run(i + 1, filtered[i])
      }

      const oldIds = db.prepare(`
        SELECT id
        FROM fsNode
        WHERE parent_id IS ?
        ORDER BY sort_order, id
      `).all(oldParentId).map(r => r.id)

      for (let i = 0; i < oldIds.length; i++) {
        prepUpdate.run(i + 1, oldIds[i])
      }
    })

    try {
      tsx()
      return {ok: true}
    } catch (err) {
      console.error("[fsNodes:move] failed:", err)
      return {ok: false}
    }
  }
})


// fetch entire row of fsNodes to construct fsTree
ipcMain.handle('fsNodes:fetch', (_event, _payload) => {
  try {
    // order by parent and sort_order
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
  fs.writeFileSync(path.join(dirPath, "index.json"), editorData, "utf8")

})

ipcMain.handle("editor:fetch", (_event, payload) => {
  const storagePath = payload.storagePath
  const dirPath = path.join(app.getPath("userData"), storagePath)
  const filePath = path.join(dirPath, "index.json")

  let editorData = ""
  try {
    editorData = fs.readFileSync(filePath, "utf8")
  } catch {
    editorData = "" // file not found yet
  }

  return { ok: true, editorData }
})

ipcMain.handle("editor:loadConfig", (_event, payload) => {
  const id = payload.id

  const row = db
    .prepare(`
      SELECT toolbar_is_visible, editor_theme
      FROM fileConfig
      WHERE file_id = ?
    `)
    .get(id)

  // if missing, fall back to defaults
  if (!row) {
    return { ok: true, toolbarIsVisible: false, editorTheme: "black" }
  }

  return {
    ok: true,
    toolbarIsVisible: Boolean(row.toolbar_is_visible),
    editorTheme: row.editor_theme === "white" ? "white" : "black",
  }
})

ipcMain.handle("editor:switchTheme", (_event, payload) => {
  const id = payload.id
  const theme = payload.theme // "black" | "white"

  db.prepare(`
    UPDATE fileConfig
    SET editor_theme = ?
    WHERE file_id = ?
  `).run(theme, id)

  return { ok: true }
})