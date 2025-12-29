const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    createFolder: (name, parentId) => 
        ipcRenderer.invoke('folders:create', { name, parentId }),
    listFolders: (parentId) =>
    ipcRenderer.invoke('folders:list', parentId === undefined ? {} : { parentId })
})
