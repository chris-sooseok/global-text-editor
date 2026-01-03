const { contextBridge, ipcRenderer } = require('electron')

async function invokeLogged(channel, payload) {
  console.log(`[ipc →] ${channel}`, payload)

  try {
    const res = await ipcRenderer.invoke(channel, payload)
    console.log(`[ipc ←] ${channel}`, res)
    return res
  } catch (err) {
    console.error(`[ipc ✖] ${channel}`, err)
    throw err
  }
}

contextBridge.exposeInMainWorld('api', {
  createFolder: (name, parentId) =>
    invokeLogged('folders:create', { name, parentId }),
  fetchFolders: (parentId) =>
    invokeLogged('folders:fetch', parentId === undefined ? {} : { parentId }),
  createFile: (name, parentId) =>
    invokeLogged('files:create', {name, parentId }),
  fetchFiles: (parentId) =>
    invokeLogged('files:fetch', parentId === undefined ? {} : { parentId }),
})