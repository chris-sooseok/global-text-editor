const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')
const path = require("node:path")
const fs = require("node:fs")

const db = connect_db()

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