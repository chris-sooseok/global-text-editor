const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')
const path = require("node:path")
const fs = require("node:fs")

const db = connect_db()

ipcMain.handle("editors:load", (_event, payload) => {
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

ipcMain.handle('editors:save', (_event, payload) => {
  debugger
  const storagePath = payload.storagePath
  const fileContent = payload.fileContent

  try {
    const dirPath = path.join(app.getPath("userData"), storagePath)
    fs.writeFileSync(path.join(dirPath, "index.json"), fileContent, "utf8")
    return {ok: true}
  } catch(err) {
    console.error('[editors:save] failed:', err)
    return {ok: false, message: "Failed to save file content" }
  }
})

