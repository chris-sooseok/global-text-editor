const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
  listNotes: () => ipcRenderer.invoke('notes:list'),
  addNote: (text) => ipcRenderer.invoke('notes:add', text)
})
