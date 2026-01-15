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
  createFsNode: (type, parentId, name, mimeType) =>
    invokeLogged('fsNodes:create', { type, parentId, name, mimeType}),
  deleteFsNode: (id, type) =>
    invokeLogged('fsNodes:delete', { id, type }),
  fetchFsNodes: () =>
    invokeLogged('fsNodes:fetch', {})
})