import { useState, useContext } from 'react'
import { FsTreeContext } from '../context/FsTreeContext'
import type { FsNode } from '../context/fsNode'

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
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Root nodes</div>

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
                    {isFolder ? '📁' : '📄'} {node.name}
                    {isSelectedFolder ? ' (selected)' : ''}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div style={{ fontSize: 13, opacity: 0.85 }}>
        Creating under: {selectedParentId === null ? 'Root' : `Folder ID ${selectedParentId}`}
        {selectedParentId !== null && (
          <button type="button" style={{ marginLeft: 8 }} onClick={() => setSelectedParentId(null)}>
            Clear
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="New folder/file name"
          value={fsNodeName}
          onChange={(e) => setFsNodeName(e.target.value)}
        />

        <button type="button" onClick={() => handleCreateFsNode('folder')}>
          + Folder
        </button>

        <button type="button" onClick={() => handleCreateFsNode('file')}>
          + File
        </button>
      </div>
    </aside>
  )
}
