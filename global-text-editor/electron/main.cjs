const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const Database = require('better-sqlite3')

let db = null

function getDb() {
  if (db) return db

  // Where your DB file will live (per-user app data dir)
  const dbPath = path.join(app.getPath('userData'), 'app.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `)

  return db
}

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

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const isDev = !app.isPackaged

  if (isDev) {
    win.loadURL('http://localhost:5173')
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  registerIpc()
  getDb() // create db + tables early
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  if (db) db.close()
})
