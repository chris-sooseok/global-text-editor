import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react"
import type { FsNode } from "../../context/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'

export type SelectedNodeType =
  | { parentId: number | null; type : 'folder' | 'file' | null; nodeId: number | null}

export async function submitCreatePromptHelper({
  promptInputRef,
  createType,
  selectedNode,
  selectedParentId,
  setSelectedParentId,
  setCreateType,
}: {
  promptInputRef: RefObject<HTMLInputElement | null>
  createType: 'folder' | 'file' | null
  selectedNode: SelectedNodeType
  selectedParentId: number | null
  //* Dispath is a function that tkaes one argument and returns void
  setSelectedParentId: Dispatch<SetStateAction<number | null>>
  setCreateType: Dispatch<SetStateAction<'folder' | 'file' | null>> 
}): Promise<void> {
  if (!createType) return

  const name = promptInputRef.current?.value ?? ''
  if (name.trim() === '') {
    cancelCreatePromptHelper({setCreateType, promptInputRef})
    return
  }

  // create under selected folder, or under root if none selected
  const parentId = selectedNode.parentId
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

export function cancelCreatePromptHelper({setCreateType, promptInputRef}: {
  setCreateType: Dispatch<SetStateAction<'folder' | 'file' | null>>
  promptInputRef: RefObject<HTMLInputElement | null>
}): void {
  setCreateType(null)
  if (promptInputRef.current) {
    promptInputRef.current.value = ''
  }
}

export function renderCreatePromptHelper({
  createType,
  selectedNode,
  depth,
  promptRef,
  promptInputRef,
  expandedFolderIds,
  setSelectedNode,
  submitCreatePrompt,
  cancelCreatePrompt,
}: {
    createType: 'folder' | 'file' | null
    selectedNode: SelectedNodeType
    depth: number
    promptRef: RefObject<HTMLDivElement | null>
    promptInputRef: RefObject<HTMLInputElement | null>
    expandedFolderIds: Set<number>
    setSelectedNode: Dispatch<SetStateAction<SelectedNodeType>>
    submitCreatePrompt: () => Promise<void>
    cancelCreatePrompt: () => void
}): ReactNode  {
  if (!createType) return null


  return (
    <li key={`__create_prompt__:${selectedNode.parentId ?? 'root'}:${createType}`}>
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
  selectedNode,
  expandedFolderIds,
  setExpandedFolderIds,
  setSelectedNode,
  renderCreatePrompt,
  renderNode
}: {
      node: FsNode,
      depth: number
      createType: 'folder' | 'file' | null
      selectedNode: SelectedNodeType
      selectedParentId: number | null
      expandedFolderIds: Set<number>
      setExpandedFolderIds: Dispatch<SetStateAction<Set<number>>>
      setSelectedNode: Dispatch<SetStateAction<SelectedNodeType>>
      renderCreatePrompt: (depth: number) => ReactNode
      renderNode: (node: FsNode, depth?: number) => ReactNode
}): ReactNode {
  // File Node Row
  console.log(selectedNode)
  if (node.type !== 'folder') {
    const isSelectedFile = selectedNode.nodeId === node.id
    const isParentExpanded = expandedFolderIds.has(node.parentId)

    return (
      <li key={node.id}>
        <div style={{ 
          paddingLeft: depth * 7,
          cursor: 'pointer',
          fontWeight: isSelectedFile ? 700 : 400,
          userSelect: 'none',

          background: isSelectedFile ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
          borderRadius: 6,
          paddingTop: 2,
          paddingBottom: 2,  
        }}
        onClick={() => {
          // if already selected, return
          if (isSelectedFile) {
            return
          }

          // if not selected, update seletedNode
          console.log(isParentExpanded)
               setSelectedNode({parentId: node.parentId, type: node.type, nodeId: node.id})
          
        }}
        >
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
  const isSelectedFolder = selectedNode?.nodeId === node.id
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

          background: isSelectedFolder ? 'rgba(59, 130, 246, 0.18)' : 'transparent', // light blue
          borderRadius: 6,
          paddingTop: 2,
          paddingBottom: 2,
        }}
        onClick={() => {
          // if unfolded folder is not highlighted, simply rehighlight it
          if (!isSelectedFolder && isExpanded) {
            setSelectedNode({parentId: node.parentId, type: node.type, nodeId : node.id})
            return
          }
          
          // update highlight and toggle folder as we select
          setExpandedFolderIds((prev) => {
            const next = new Set(prev)
            if (next.has(node.id)) next.delete(node.id)
            else next.add(node.id)
            console.log(next)
            return next
          })

          setSelectedNode(() => {
            return isSelectedFolder
              ? { nodeId: null, type: null, parentId: null}
              : { nodeId: node.id, type: node.type, parentId: node.parentId }
          })
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
          {createType && selectedNode?.nodeId === node.id ? renderCreatePrompt(depth + 1) : null}
        </ul>
      )}
    </li>
  )
}