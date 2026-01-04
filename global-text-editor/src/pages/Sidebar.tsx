import { useState, useCallback, useEffect, useContext } from 'react'
import { FsTreeContext } from '../context/FsTreeContext'

export default function Sidebar() {

  const tree = useContext(FsTreeContext)

  console.log(tree)

  const [folderName, setFolderName] = useState('')
  const [folderParentId, setFolderParentId] = useState('')

  const [fileName, setFileName] = useState('')
  const [fileParentId, setFileParentId] = useState('')


  const handleCreateFolder = useCallback(async () => {

    const parentId = folderParentId === '' ? null: Number(folderParentId)

    const res = await window.api.createFolder(folderName, parentId)
  
    if (res.ok) {
      console.log(`${folderName} is created`)
    }
  }, [folderName, folderParentId])

  const handleCreateFile = useCallback(async () => {

    const parentId = fileParentId === '' ? null: Number(fileParentId)
   
    const res = await window.api.createFile(fileName, parentId)

    if (res.ok) {
      console.log(`${fileName} is created`)
    }

  }, [fileName, fileParentId])

  return (
    <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <input
          placeholder="parentId (blank = root)"
          value={folderParentId}
          onChange={(e) => setFolderParentId(e.target.value)}
        />
        <button type="button" onClick={handleCreateFolder}>
          + Folder
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <input
          placeholder="folderId (blank = root)"
          value={fileParentId}
          onChange={(e) => setFileParentId(e.target.value)}
        />
        <button type="button" onClick={handleCreateFile}>
          + File
        </button>
      </div>
    </aside>
  )
}
