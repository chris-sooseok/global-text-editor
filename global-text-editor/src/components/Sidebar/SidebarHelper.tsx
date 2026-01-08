import { useContext, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FsNode } from "../../context/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'
import { FsTreeContext } from '../../context/FsTreeContext'
import type { FsTree } from "../../context/FsTree"

// define selectedNode type
export type SelectedNodeType = {parentId: number | null; type : 'folder' | 'file' | null; nodeId: number | null}
// used to define empty selectedNode state
export const EMPTY_SELECTED_NODE = {parentId: null, type: null, nodeId: null}

export async function submitNewNodePromptHelper({
  newNodePromptInputRef,
  newNodeType,
  selectedNode,
  setSelectedNode,
  setNewNodeType,
  FsTree,
}: {
  newNodePromptInputRef: RefObject<HTMLInputElement | null>
  newNodeType: 'folder' | 'file' | null
  selectedNode: SelectedNodeType,
  setSelectedNode: Dispatch<SetStateAction<SelectedNodeType>>
  //* Dispath is a function that tkaes one argument and returns void
  setNewNodeType: Dispatch<SetStateAction<'folder' | 'file' | null>> 
  FsTree: {fsTree: FsTree}
}): Promise<void> {

  try {
    if (!newNodeType) return

    const name = newNodePromptInputRef.current?.value ?? ''
    // if name is not provided, cancel newNodePrompt
    if (name.trim() === '') {
      cancelNewNodePromptHelper({setNewNodeType: setNewNodeType, newNodePromptInputRef: newNodePromptInputRef})
      return
    }

    // new node should have selected folder's id
    const parentId = selectedNode.nodeId
    // if selected node id is null, this new node is a root node
    const isRoot = selectedNode.nodeId == null ? true : false
    const res = await window.api.createFsNode(isRoot, newNodeType, parentId, name)

    setNewNodeType(null)
    if (newNodePromptInputRef.current) {
      newNodePromptInputRef.current.value = ''
    }

    if (res.ok) {
      // append new node to the FsTree
      FsTree.fsTree.insertNewNode(res.node)
      // highlight newly created node
      setSelectedNode({
        parentId: res.node.parentId,
        type: res.node.type,
        nodeId: res.node.id})

    } else {
      console.error(res.message)
    }

  } catch (err) {
    console.error(err)
  }
  
}

/** canceling newNodePrompt cleans out newNodeType and its prompt input */
export function cancelNewNodePromptHelper({setNewNodeType, newNodePromptInputRef}: {
  setNewNodeType: Dispatch<SetStateAction<'folder' | 'file' | null>>
  newNodePromptInputRef: RefObject<HTMLInputElement | null>
}): void {
  setNewNodeType(null)
  if (newNodePromptInputRef.current) {
    newNodePromptInputRef.current.value = ''
  }
}

export function renderNewNodePromptHelper({
  newNodeType,
  selectedNode,
  depth,
  newNodePromptRef,
  newNodePromptInputRef,
  submitNewNodePrompt,
  cancelNewNodePrompt,
}: {
    newNodeType: 'folder' | 'file' | null
    selectedNode: SelectedNodeType
    depth: number
    newNodePromptRef: RefObject<HTMLDivElement | null>
    newNodePromptInputRef: RefObject<HTMLInputElement | null>
    submitNewNodePrompt: () => Promise<void>
    cancelNewNodePrompt: () => void
}): ReactNode  {
  if (!newNodeType) return null

  return (
    <li key={`__create_new_node_under__:${selectedNode.parentId ?? 'root'}:${newNodeType}`}>
      <div
        ref={newNodePromptRef}
        style={{
          paddingLeft: depth * 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Prompt input box */}
        <input
          ref={newNodePromptInputRef}
          placeholder={newNodeType === 'folder' ? 'New folder name' : 'New file name'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submitNewNodePrompt()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              cancelNewNodePrompt()
            }
          }}
          style={{ flex: 1 }}
        />
      </div>
    </li>
  )
}

export function renderNodeHelper({
  // file/folder needed
  node,
  depth,
  selectedNode,
  setSelectedNode,
  // only folder needed
  renderNode,
  newNodeType,
  expandedFolderIds,
  toggleFolder,
  renderNewNodePrompt,
}: {
  node: FsNode
  depth: number
  selectedNode: SelectedNodeType
  setSelectedNode: Dispatch<SetStateAction<SelectedNodeType>>
  renderNode: (node: FsNode, depth?: number) => ReactNode
  newNodeType: 'folder' | 'file' | null
  expandedFolderIds: Set<number>
  toggleFolder: (nodeId: number) => void
  renderNewNodePrompt: (depth: number) => ReactNode
}): ReactNode {
  
  // File Node Row
  if (node.type == 'file') {
    const isSelectedFile = selectedNode.nodeId === node.id

    return (
      <li key={node.id}>
        <div 
          file-node-row="true"
          style={{ 
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
          // if file is already highlighted, return
          if (isSelectedFile) return
          
          // if file is unhighlighted, highlight
          if (!isSelectedFile){
            setSelectedNode({parentId: node.parentId, type: node.type, nodeId: node.id})
          }
          
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
        folder-node-row="true"
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
          // if folder is unfolded, but not highlighted, simply rehighlight it
          if (!isSelectedFolder && isExpanded) {
            setSelectedNode({parentId: node.parentId, type: node.type, nodeId : node.id})
            return
          }
          
          // if folder is unfolded, and highlighted, fold and unhighlight
          if (isSelectedFolder && isExpanded) {
            setSelectedNode(EMPTY_SELECTED_NODE)
            toggleFolder(node.id)
            return
          }

          // if folder is folded, and not highlighted, unfold and highlight
          if (!isSelectedFolder && !isExpanded){
            setSelectedNode({nodeId: node.id, type: node.type, parentId: node.parentId})
            toggleFolder(node.id)
          }
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
          {newNodeType && selectedNode.nodeId === node.id ? renderNewNodePrompt(depth + 1) : null}
        </ul>
      )}
    </li>
  )
}