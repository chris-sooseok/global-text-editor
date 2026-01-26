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
  /* Sidebar Apis */
  createFsNode: (type, parentId, name, mimeType, fileType) =>
    invokeLogged('fsNodes:create', { type, parentId, name, mimeType, fileType}),
  renameFsNode: (id, newName) =>
    invokeLogged('fsNodes:rename', { id, newName}),
  removeFsNode: (removeNode) =>
    invokeLogged('fsNodes:remove', { removeNode }),
  moveFsNode: (node, targetNode, newParentId, dropPosition ) =>
    invokeLogged("fsNodes:move", { node, targetNode, newParentId, dropPosition}),
  fetchFsNodes: () =>
    invokeLogged('fsNodes:fetch', {}),

  /* Editor Apis */
  loadFileContent: (storagePath) => invokeLogged('editors:load', {storagePath}),
  saveFileContent: (storagePath, fileContent) => 
    invokeLogged('editors:save', { storagePath, fileContent}),

  /* Editor Config */
  loadFileConfig: (id) => invokeLogged('editors:loadConfig', {id}),
  changeEditorTheme: (id, theme) => invokeLogged('editors:changeEditorTheme', {id, theme}),

})