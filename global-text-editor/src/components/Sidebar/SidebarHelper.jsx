import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'

export async function submitCreatePromptHelper({
  promptInputRef,
  createType,
  selectedParentId,
  setSelectedParentId,
  setCreateType,
}) {
  if (!createType) return

  const name = promptInputRef.current?.value ?? ''
  if (name.trim() === '') {
    cancelCreatePromptHelper(setCreateType, promptInputRef)
    return
  }

  // create under selected folder, or under root if none selected
  const parentId = selectedParentId ?? null
  const res = await window.api.createFsNode(createType, parentId, name)

  if (res.ok) {
    setSelectedParentId(null)
    setCreateType(null)
    if (promptInputRef.current) {
      promptInputRef.current.value = ''
    }
  } else {
    console.error(res.message)
  }
}

export function cancelCreatePromptHelper(setCreateType, promptInputRef) {
  setCreateType(null)
  if (promptInputRef.current) {
    promptInputRef.current.value = ''
  }
}

export function renderCreatePromptHelper({
  createType,
  selectedParentId,
  depth,
  promptRef,
  promptInputRef,
  submitCreatePrompt,
  cancelCreatePrompt,
}) {
  if (!createType) return null

  return (
    <li key={`__create_prompt__:${selectedParentId ?? 'root'}:${createType}`}>
      <div
        ref={promptRef}
        style={{
          paddingLeft: depth * 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Prompt input box */}
        <input
          ref={promptInputRef}
          placeholder={createType === 'folder' ? 'New folder name' : 'New file name'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submitCreatePrompt()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              cancelCreatePrompt()
            }
          }}
          style={{ flex: 1 }}
        />
      </div>
    </li>
  )
}

export function renderNodeHelper({
  node,
  depth,
  createType,
  selectedParentId,
  expandedFolderIds,
  toggleFolderHandler,
  setSelectedParentId,
  renderCreatePrompt,
  renderNode
}) {
  // File Node Row
  if (node.type !== 'folder') {
    return (
      <li key={node.id}>
        <div style={{ paddingLeft: depth * 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <img
              src={fileIcon}
              alt=""
              aria-hidden="true"
              style={{ width: 18, height: 18, display: 'block' }}
            />
            <span>{node.name}</span>
          </span>
        </div>
      </li>
    )
  }

  // Folder Node Row
  const isSelectedFolder = selectedParentId === node.id
  const isExpanded = expandedFolderIds.has(node.id)
  const children = Array.isArray(node.children) ? node.children : []

  return (
    <li key={node.id}>
      <div
        data-folder-row="true"
        style={{
          paddingLeft: depth * 5,
          cursor: 'pointer',
          fontWeight: isSelectedFolder ? 700 : 400,
          userSelect: 'none',
        }}
        onClick={() => {
          // if unfolded folder is not highlighted, simply rehighlight it
          if (!isSelectedFolder && isExpanded) {
            setSelectedParentId(node.id)
            return
          }
          
          // Safe guard: this can't occur since select and toggle happen synchronously
          if (isSelectedFolder && !isExpanded) {
            toggleFolderHandler(node.id)
          }

          // update highlight and toggle folder as we select
          toggleFolderHandler(node.id)
          setSelectedParentId((prev) => (prev === node.id ? null : node.id))
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
            {isExpanded ? '▾' : '▸'}
          </span>
          <img
            src={folderIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 18, height: 18, display: 'block' }}
          />
          <span>{node.name}</span>
        </span>
      </div>

      {/* recursively render children node */}
      {isExpanded && (
        <ul style={{ margin: 0, paddingLeft: 8 }}>
          {children.map((child) => renderNode(child, depth + 1))}

          {/* folder prompt */}
          {createType && selectedParentId === node.id ? renderCreatePrompt(depth + 1) : null}
        </ul>
      )}
    </li>
  )
}