const { app, BrowserWindow, protocol} = require('electron')
const path = require('node:path')
const { migrate, close_db } = require("./db/index.cjs");


// images
protocol.registerSchemesAsPrivileged([
  {
    scheme: "gtext",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
])

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
    // ✅ 2) register protocol handler
  protocol.registerFileProtocol("gtext", (request, callback) => {
    try {
      const u = new URL(request.url)
      // gtext://nodes/<uuid>/assets/<file>
      const rel = path.posix.join(u.host, u.pathname)
      const relPath = decodeURIComponent(rel)
      const absPath = path.join(app.getPath("userData"), relPath)
      callback({ path: absPath })
    } catch (err) {
      console.error("[gtext protocol] failed:", err)
      callback({ error: -2 })
    }
  })

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
