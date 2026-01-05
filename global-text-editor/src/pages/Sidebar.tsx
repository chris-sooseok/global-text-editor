import { useState, useCallback, useContext } from 'react'
import { FsTreeContext } from '../context/FsTreeContext'

export default function Sidebar() {

  const fsTree = useContext(FsTreeContext)

  console.log(fsTree?.tree?.roots)

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

  const renderNode = (node: any, depth = 0) => {
    const isFolder = node.type === 'folder'
    const children = isFolder && Array.isArray(node.children) ? node.children : []

    return (
      <li key={`${node.type}-${node.id}`}>
        <div style={{ paddingLeft: depth * 14 }}>
          {isFolder ? '📁' : '📄'} {node.name}
        </div>

        {isFolder && children.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {children.map((child: any) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* display full tree */}
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>All nodes</div>

        {!fsTree?.tree?.roots || fsTree.tree.roots.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No items</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {fsTree.tree.roots.map((node: any) => renderNode(node, 0))}
          </ul>
        )}
      </div>

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
          placeholder="parentId (blank = root)"
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
