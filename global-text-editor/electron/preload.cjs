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
  createFsNode: (type, parentId, name) =>
    invokeLogged('fsNodes:create', { type, parentId, name}),
  renameFsNode: (id, newName) =>
    invokeLogged('fsNodes:rename', { id, newName}),
  removeFsNode: (removeNode) =>
    invokeLogged('fsNodes:remove', { removeNode }),
  moveFsNode: (node, targetNode, newParentId, dropPosition ) =>
    invokeLogged("fsNodes:move", { node, targetNode, newParentId, dropPosition}),
  fetchFsNodes: () =>
    invokeLogged('fsNodes:fetch', {}),

  /* Editor Apis */
  loadFileContent: (storagePath) => invokeLogged('editors:loadContent', {storagePath}),
  saveFileContent: (fileId, storagePath, fileContent, originTabId) => 
    invokeLogged('editors:saveContent', { fileId, storagePath, fileContent, originTabId}),
  saveImageAsset: (storagePath, fileContent, originalName) =>
    invokeLogged("editors:saveImageAsset", { storagePath, fileContent, originalName }),



  // onFileContentUpdated: (handler) => {
  //   const listener = (_e, payload) => handler(payload)
  //   ipcRenderer.on("editors:contentUpdated", listener)
  //   // unsubscribe
  //   return () => ipcRenderer.removeListener("editors:contentUpdated", listener)
  // },

  /* Editor Config */
  loadFileConfig: (id) => invokeLogged('editors:loadConfig', {id}),
  changeEditorTheme: (id, theme) => invokeLogged('editors:changeEditorTheme', {id, theme}),

})