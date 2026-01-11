import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FsNode, FsNodeRow} from "../../context/FsTreeContext/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'
import type { FsTree } from  "../../context/FsTreeContext/FsTree"

// define selectedNode type
export type SelectedNodeType = {parentId: number | null; type : 'folder' | 'file' | null; nodeId: number | null}
// used to define empty selectedNode state
export const EMPTY_SELECTED_NODE = {parentId: null, type: null, nodeId: null}

export async function submitNewNodePromptHelper({
  newNodePromptInputRef,
  newNodeType,
  cancelNewNodePrompt,
  selectedNode,
  selectNodeHandler,
  FsTree,
  toggleFolderHandler,
}: {
  newNodePromptInputRef: RefObject<HTMLInputElement | null>
  newNodeType: 'folder' | 'file' | null
  cancelNewNodePrompt: () => void
  selectedNode: SelectedNodeType
  selectNodeHandler: ({parentId, type, nodeId}: SelectedNodeType) => void // Dispath is a function that tkaes one argument and returns void
  FsTree: {fsTree: FsTree}
  toggleFolderHandler: (nodeId: number) => void 
}): Promise<void> {

  try {

    if (!newNodeType || !newNodePromptInputRef.current) {
      cancelNewNodePrompt()
      return
    }

    // if name is not provided, cancel newNodePrompt
    const name = newNodePromptInputRef.current.value
    if (name.trim() === '') {
      cancelNewNodePrompt()
      return
    }

    // check if new node has parent node, or is a root node
    const parentId = selectedNode.nodeId
    const isRoot = parentId == null ? true : false
    const res = await window.api.createFsNode(
      isRoot, newNodeType, parentId, name
    )

    // once submitted, cancel newNodePrompt
    cancelNewNodePrompt()

    if (res.ok) {
      const newNode: FsNodeRow = res.node

      // append new node to the FsTree
      FsTree.fsTree.insertNewNode(newNode)
      
      // highlight newly created node
      selectNodeHandler({
        parentId: newNode.parentId,
        type: newNode.type,
        nodeId: newNode.id
      })

      // if newNode is a folder, toggle the folder
      if (newNode.type == 'folder') {
        toggleFolderHandler(newNode.id)
      }

    } else {
      console.error(res.message)
    }

  } catch (err) {
    // if failure, cancel newNodePrompt
    cancelNewNodePrompt()
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
  selectNodeHandler,
  // only folder needed
  renderNode,
  newNodeType,
  toggledFolderIds,
  toggleFolderHandler,
  renderNewNodePrompt,
}: {
  node: FsNode
  depth: number
  selectedNode: SelectedNodeType
  selectNodeHandler: ({parentId, type, nodeId}: SelectedNodeType) => void
  renderNode: (node: FsNode, depth?: number) => ReactNode
  newNodeType: 'folder' | 'file' | null
  toggledFolderIds: Set<number>
  toggleFolderHandler: (nodeId: number) => void
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
            selectNodeHandler({parentId: node.parentId, type: node.type, nodeId: node.id})
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
  const isExpanded = toggledFolderIds.has(node.id)
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
            selectNodeHandler({parentId: node.parentId, type: node.type, nodeId : node.id})
            return
          }
          
          // if folder is unfolded, and highlighted, fold and unhighlight
          if (isSelectedFolder && isExpanded) {
            selectNodeHandler(EMPTY_SELECTED_NODE)
            toggleFolderHandler(node.id)
            return
          }

          // if folder is folded, and not highlighted, unfold and highlight
          if (!isSelectedFolder && !isExpanded){
            selectNodeHandler({nodeId: node.id, type: node.type, parentId: node.parentId})
            toggleFolderHandler(node.id)
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