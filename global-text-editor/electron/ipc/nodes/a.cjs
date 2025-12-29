



function registerIpc() {
  ipcMain.handle('notes:list', () => {
    return getDb()
      .prepare('SELECT id, text, created_at AS createdAt FROM notes ORDER BY id DESC')
      .all()
  })

  ipcMain.handle('notes:add', (_evt, text) => {
    const createdAt = Date.now()
    const info = getDb()
      .prepare('INSERT INTO notes (text, created_at) VALUES (?, ?)')
      .run(text, createdAt)

    return { id: Number(info.lastInsertRowid), text, createdAt }
  })
}