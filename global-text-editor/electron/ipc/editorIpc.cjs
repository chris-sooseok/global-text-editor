const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')
const path = require("node:path")
const fs = require("node:fs")

const db = connect_db()

ipcMain.handle("editors:load", (_event, payload) => {
  const storagePath = payload.storagePath
  const dirPath = path.join(app.getPath("userData"), storagePath)
  const filePath = path.join(dirPath, "index.json")

  let fileContent = ""
  try {
    fileContent = fs.readFileSync(filePath, "utf8")
  } catch {
    fileContent = ""
  }

  return { ok: true, fileContent: fileContent }
})

ipcMain.handle('editors:save', (_event, payload) => {

  const id = payload.id
  const fileContent = payload.fileContent

  const row = db.prepare(`SELECT storage_path FROM fsNode WHERE id = ?`).get(id)
  const dirPath = path.join(app.getPath("userData"), row.storage_path)
  fs.writeFileSync(path.join(dirPath, "index.json"), fileContent, "utf8")

})

