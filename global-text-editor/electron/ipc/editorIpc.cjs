const { ipcMain } = require('electron')
const { connect_db } = require('../db/index.cjs')

const db = connect_db

ipcMain.handle('normalEditor:save', (_event, payload) => {

    const id = payload.id
    const json = payload.

})


ipcMain.handle('normalEditor:fetchJSON', (_event, payload) => {

    const storagePath = payload.storagePath
})