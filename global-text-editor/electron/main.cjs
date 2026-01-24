const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { migrate, close_db } = require("./db/index.cjs");

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

  win.maximize()

  const isProd = app.isPackaged

  if (isProd) {
    // getAppPath returns project root path
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  } else {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  migrate() // ensure migrating all sqls
  require("./ipc/fsNodeIpc.cjs")
  require("./ipc/editorIpc.cjs")
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  close_db()
})
