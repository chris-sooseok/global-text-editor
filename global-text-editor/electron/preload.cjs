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

  listFolders: (parentId) =>
    invokeLogged('folders:list', parentId === undefined ? {} : { parentId })
})