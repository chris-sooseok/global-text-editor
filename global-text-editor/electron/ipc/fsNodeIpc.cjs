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
} = require("./fsNodeIpcHelper.cjs")


const db = connect_db()

ipcMain.handle('fsNodes:create', (_event, payload) => {

  if (!valididateName(payload.name)) return { ok: false, message: 'Name is invalid'}
  if (!validateType(payload.type)) return { ok: false, message: "Type is invalid"}

  const uuid = randomUUID()
  const type = payload.type
  const isRoot = payload.parentId === 0 ? 1 : 0
  const parentId = payload.parentId
  const name = payload.name  
  let storagePath = ''
  const createdAt = Date.now()
  const nextSortOrder = getNextSortOrder(parentId)

  /** if file
   * 1. set storagePath
   * 2. set absStoragePath to create disk path
   * 3. create file config
  */
  let absStoragePath
  if (type === 'file') {
    storagePath = `nodes/${uuid}`
    absStoragePath = path.join(app.getPath("userData"), storagePath)
  }

  let info
  let lastInsertRowid

  const tsx = db.transaction(() => {
    info = db
      .prepare(`
        INSERT INTO fsNode (uuid, type, parent_id, isRoot, name, storage_path, created_at, updated_at, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(uuid, type, isRoot, parentId, name, storagePath, createdAt, createdAt, nextSortOrder)
    
    lastInsertRowid = Number(info.lastInsertRowid)

    if (type === "file") {
      db.prepare(`
        INSERT INTO fileConfig (file_id, editor_theme)
        VALUES (?, ?)
      `).run(lastInsertRowid, "black")
      fs.mkdirSync(absStoragePath, { recursive: true})
      fs.writeFileSync(path.join(absStoragePath, "index.json"), "", { flag: "wx" })
    }
  })
  
  try {
    tsx()
    return {
      ok: true,
      row: {
        id: lastInsertRowid,
        uuid,
        type,
        parentId,
        isRoot,
        name,
        storagePath,
        createdAt: now,
        updatedAt: now,
        sortOrder: nextSortOrder
      },
      }
  } catch (err) {
    if (type === "file" && absStoragePath) {
      fs.rmSync(absStoragePath, { recursive: true, force: true })
    }
    console.error('[fsNodes:create] failed:', err)
    return { ok: false, message: 'Failed to create fsNode' }
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
      reorderSiblings(parentId)
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
    reorderSiblings(parentId)
  })

  try {
    tsx()
    return { ok: true }
  } catch (err) {
    console.error("[fsNodes:remove] failed:", err)
    return { ok: false }
  }
})


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

      reorderSiblings(oldParentId)
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
          is_root AS isRoot,
          name,
          storage_path AS storagePath,
          created_at AS createdAt,
          updated_at AS updatedAt,
          sort_order AS sortOrder
        FROM fsNode 
        WHERE id != 0 -- filter seed node
        ORDER BY parent_id, sort_order
      `)
      .all()

    return { ok: true, rows }

  } catch (err) {
    console.error('[fsNode:fetch] failed:', err)
    return { ok: false, message: 'Failed to fetch fsNode'}
  }
})


