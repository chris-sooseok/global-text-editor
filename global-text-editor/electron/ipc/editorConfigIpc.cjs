const { ipcMain, app } = require("electron")
const { connect_db } = require('../db/index.cjs')

const db = connect_db()

ipcMain.handle("editorConfig:load", (_event, payload) => {
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

ipcMain.handle('editorConfig:changeTheme', (_event, payload) => {

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
