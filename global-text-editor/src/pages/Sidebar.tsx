import { useState, useContext } from 'react'
import { FsTreeContext } from '../context/FsTreeContext'

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

  // default for Enter key
  async function handleSubmitDefault(e: React.FormEvent) {
    e.preventDefault()
    await handleCreateFsNode('folder')
  }

  async function handleClickSubmit(e: React.MouseEvent<HTMLButtonElement>, type: 'folder' | 'file') {
    e.preventDefault() // prevent the form's default submit
    await handleCreateFsNode(type)
  }

  function renderNode(node: any, depth = 0) {
    const isFolder = node.type === 'folder'
    const children = isFolder && Array.isArray(node.children) ? node.children : []
    const isSelectedFolder = isFolder && selectedParentId === node.id

    return (
      <li key={`${node.type}-${node.id}`}>
        <div
          style={{
            paddingLeft: depth * 14,
            cursor: isFolder ? 'pointer' : 'default',
            fontWeight: isSelectedFolder ? 700 : 400,
            opacity: isSelectedFolder ? 1 : 0.95,
          }}
          onClick={() => {
            if (!isFolder) return
            setSelectedParentId((prev) => (prev === node.id ? null : node.id))
          }}
        >
          {isFolder ? '📁' : '📄'} {node.name}
          {isSelectedFolder ? ' (selected)' : ''}
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

      <div style={{ fontSize: 13, opacity: 0.85 }}>
        Creating under: {selectedParentId === null ? 'Root' : `Folder ID ${selectedParentId}`}
        {selectedParentId !== null && (
          <button type="button" style={{ marginLeft: 8 }} onClick={() => setSelectedParentId(null)}>
            Clear
          </button>
        )}
      </div>

      {/* One input, two buttons, no extra state */}
      <form style={{ display: 'flex', gap: 8 }} onSubmit={handleSubmitDefault}>
        <input
          placeholder="New folder/file name"
          value={fsNodeName}
          onChange={(e) => setFsNodeName(e.target.value)}
        />

        <button type="submit" onClick={(e) => handleClickSubmit(e, 'folder')}>
          + Folder
        </button>

        <button type="submit" onClick={(e) => handleClickSubmit(e, 'file')}>
          + File
        </button>
      </form>
    </aside>
  )
}
