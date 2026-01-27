const { ipcMain, app } = require("electron")
const path = require("node:path")
const fs = require("node:fs")
const { randomUUID } = require("node:crypto")
const { pathToFileURL } = require("node:url")
const { connect_db } = require("../db/index.cjs")

const db = connect_db()

ipcMain.handle("editors:loadConfig", (_event, payload) => {
  const id = payload.id

  try {
    const row = db
      .prepare(`
        SELECT editor_theme
        FROM fileConfig
        WHERE file_id = ?
      `)
      .get(id)

    return {
      ok: true,
      editorTheme: row.editor_theme,
    }

  } catch (err) {
    console.error('[editors:loadConfig] failed:', err)
    return { ok: false}
  }
})

ipcMain.handle('editors:changeEditorTheme', (_event, payload) => {

  const id = payload.id
  const theme = payload.theme // "black" | "white"
  try {
    db.prepare(`
        UPDATE fileConfig
        SET editor_theme = ?
        WHERE file_id = ?
    `).run(theme, id)

    return { ok: true }
  } catch {
    return { ok: false }
  }
})

ipcMain.handle("editors:loadContent", (_event, payload) => {
  const storagePath = payload.storagePath
  const dirPath = path.join(app.getPath("userData"), storagePath)
  const filePath = path.join(dirPath, "index.json")

  try {    
    const fileContent = fs.readFileSync(filePath, "utf8")
    return { ok: true, fileContent: fileContent }
  } catch(err) {
    console.error('[editors:load] failed:', err)
    return {ok : false, message: "Failed to load file content"}
  }
})

ipcMain.handle('editors:saveContent', (_event, payload) => {
  const { fileId, storagePath, fileContent, originTabId } = payload
  
  try {
    const dirPath = path.join(app.getPath("userData"), storagePath)
    fs.writeFileSync(path.join(dirPath, "index.json"), fileContent, "utf8")

    // ? Not needed now
    // for (const win of BrowserWindow.getAllWindows()) {
    //   win.webContents.send("editors:contentUpdated", { fileId, fileContent, originTabId })
    // }

    return {ok: true}
  } catch(err) {
    console.error('[editors:save] failed:', err)
    return {ok: false, message: "Failed to save file content" }
  }
})

ipcMain.handle("editors:saveImageAsset", (_event, payload) => {
  const { storagePath, fileContent, originalName } = payload

  try {
    if (!storagePath || !fileContent) {
      return { ok: false, message: "Missing storagePath or fileContent" }
    }

    const assetsDir = path.join(app.getPath("userData"), storagePath, "assets")
    fs.mkdirSync(assetsDir, { recursive: true })

    const ext = (path.extname(originalName || "") || ".png").toLowerCase()
    const filename = `${randomUUID()}${ext}`
    const absDest = path.join(assetsDir, filename)

    // fileContent is an ArrayBuffer
    const buf = Buffer.from(new Uint8Array(fileContent))
    fs.writeFileSync(absDest, buf)

    const src = `gtext://${storagePath}/assets/${filename}`
    return { ok: true, src, filename }
  } catch (err) {
    console.error("[editors:saveImageAsset] failed:", err)
    return { ok: false, message: "Failed to save image asset" }
  }
})
