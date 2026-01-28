const { app, BrowserWindow, protocol} = require('electron')
const path = require('node:path')

/** Eelectron Setup Flow
 * When Electron launches, it starts the main process (node.js) environment, and
 * runs main entry file (main.cjs) from top bottom order like normal Node
 * 
 * Once main entry file is loaded,
 * 1. Sets up userData path as neccessary
 * 2. Do early Electron configuration that must exist before app is ready
 *    (ex: protocol.registerSchemesAsPrivileged for custom schemes).
 * 3. Register event handlers
 *  1. whenReady callback
 *  2. window close callback
 *  3. quit callback
 *  
 * When app becomes ready (whenReady callback runs):
 * - Initialize services (db.migrate, IPC handlers, protocol handlers)
 * - Create BrowserWindow and load UI
 */

const isDev = !app.isPackaged

/** If Dev, set up dev userData path */
if (isDev) {
  const devUserData = path.join(app.getPath("appData"), `${app.getName()}-dev`)
  app.setPath("userData", devUserData)
}

// load db after userData path is setup
const db = require("./db/index.cjs")

/** When electron config is complete, render window */
function createBrowserWindow() {
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
  if (isDev) {
    // load React into the browser window
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    // getAppPath returns project root path
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }
}

/* Image Protocol Handler */
protocol.registerSchemesAsPrivileged([
  {
    scheme: "gtext",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
])

app.whenReady().then(() => {
  db.migrate()

    //  register protocol handler
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

  require("./ipc/fsNodeIpc.cjs")
  require("./ipc/editorIpc.cjs")
  createBrowserWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  db.close_db()
})
