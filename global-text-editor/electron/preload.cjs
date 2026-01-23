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
    invokeLogged('fsNodes:rename', { id, newName}),
  removeFsNode: (id) =>
    invokeLogged('fsNodes:remove', { id }),
  fetchFsNodes: () =>
    invokeLogged('fsNodes:fetch', {}),

  fetchNormalEditor: (storagePath) =>
    invokeLogged('editor:fetch', {storagePath}),

  saveNormalEditor: (id, editorData) =>
    invokeLogged('editor:save', {id, editorData}),

  loadFileConfig: (id) => invokeLogged('editor:loadConfig', {id}),

  switchEditorTheme: (id, theme) => invokeLogged('editor:switchTheme', {id, theme})

})