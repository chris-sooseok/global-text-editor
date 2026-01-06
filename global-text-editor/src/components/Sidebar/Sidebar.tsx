import { useState, useContext } from 'react'
import { FsTreeContext } from '../../context/FsTreeContext'
import type { FsNode } from '../../context/FsTreeTypes'
import newFolderIcon from '../../assets/icons8-add-folder-96-black.png'
import newFileIcon from '../../assets/icons8-add-file-96-black.png'
import folderIcon from '../../assets/icons8-folder-96.png'
import IconButton from './IconButton'

export default function Sidebar() {
  const fsTree = useContext(FsTreeContext)

  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  const [fsNodeName, setFsNodeName] = useState<string>('')

  async function handleCreateFsNode(type: 'folder' | 'file') {
    const parentId = selectedParentId
    const res = await window.api.createFsNode(type, parentId, fsNodeName)

    if (res.ok) {
      setSelectedParentId(null)
      setFsNodeName('')
    }
  }

  return (
    <aside style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <IconButton
            src={newFolderIcon}
            label="Create folder"
            buttonSize={28}
            iconSize={16}
            background='white'
            onClick={() => handleCreateFsNode('folder')}
          />

          <IconButton
            src={newFileIcon}
            label="Create file"
            buttonSize={28}
            iconSize={16}
            background='white'
            onClick={() => handleCreateFsNode('file')}
          />
        </div>
      </div>

      <div>
        {!fsTree?.tree?.roots || fsTree.tree.roots.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No items</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {fsTree.tree.roots.map((node: FsNode) => {
              const isFolder = node.type === 'folder'
              const isSelectedFolder = isFolder && selectedParentId === node.id

              return (
                <li key={`${node.type}-${node.id}`}>
                  <div
                    style={{
                      cursor: isFolder ? 'pointer' : 'default',
                      fontWeight: isSelectedFolder ? 700 : 400,
                    }}
                    onClick={() => {
                      if (!isFolder) return
                      setSelectedParentId((prev) => (prev === node.id ? null : node.id))
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {isFolder ? (
                        <img
                          src={folderIcon}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 20, height: 20, display: 'block' }}
                        />
                      ) : (
                        <span aria-hidden="true">📄</span>
                      )}

                      <span>{node.name}</span>

                      {isSelectedFolder ? <span style={{ opacity: 0.7 }}> (selected)</span> : null}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="New folder/file name"
          value={fsNodeName}
          onChange={(e) => setFsNodeName(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
    </aside>
  )
}
