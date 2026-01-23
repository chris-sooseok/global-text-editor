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
  createFsNode: (type, parentId, name, mimeType, fileType) =>
    invokeLogged('fsNodes:create', { type, parentId, name, mimeType, fileType}),
  renameFsNode: (id, newName) =>
    invokeLogged('fsNode:rename', { id, newName}),
  deleteFsNode: (id) =>
    invokeLogged('fsNodes:delete', { id }),
  fetchFsNodes: () =>
    invokeLogged('fsNodes:fetch', {}),

  saveNormalEditor: (id, editorData) =>
    invokeLogged('editor:save', {id, editorData}),
  fetchNormalEditor: (storagePath) =>
    invokeLogged('normalEditor:fetchJSON', {storagePath})
})