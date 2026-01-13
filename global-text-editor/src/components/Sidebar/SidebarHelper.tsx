import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FsNode, FsNodeRow} from "../../context/FsTreeContext/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'
import type { FsTree } from  "../../context/FsTreeContext/FsTree"
import { computeMimeTypeFromName } from "./MimeType"

// define selectedNode type
export type SelectedNodeType = FsNode | EMPTY_SELECTED_NODE_TYPE
// used to define empty selectedNode state
export type EMPTY_SELECTED_NODE_TYPE = {
  id: null,
  type: null,
  parentId: null,
}
export const EMPTY_SELECTED_NODE = {
  id: null,
  type: null,
  parentId: null,
}

export async function submitNewNodePromptHandler(
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  newNodeType: 'folder' | 'file' | null,
  cancelNewNodePrompt: () => void,
  selectedNode: SelectedNodeType,
  selectNodeHandler: (node: SelectedNodeType) => void, // Dispath is a function that tkaes one argument and returns void
  FsTree: {fsTree: FsTree},
  toggleFolderHandler: (nodeId: number) => void 
): Promise<void> {

  try {

    if (!newNodeType || !newNodePromptInputRef.current) {
      cancelNewNodePrompt()
      return
    }

    // if name is not provided, cancel newNodePrompt
    const name = newNodePromptInputRef.current.value
    const trimmed = name.trim()
    if (trimmed=== '') {
      cancelNewNodePrompt()
      return
    }

    // check if new node has parent node, or is a root node
    const parentId = selectedNode.id
    const isRoot = parentId == null ? true : false
    const mimeType = computeMimeTypeFromName(trimmed)
    const res = await window.api.createFsNode(
      isRoot, newNodeType, parentId, name, mimeType
    )

    // once submitted, cancel newNodePrompt
    cancelNewNodePrompt()

    if (res.ok) {
      const newNode: FsNodeRow = res.node

      // append new node to the FsTree
      const newFsNode: FsNode = FsTree.fsTree.insertNewNode(newNode)
      
      // highlight newly created node
      selectNodeHandler(newFsNode)

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
export function cancelNewNodePromptHandler(
  setNewNodeType: Dispatch<SetStateAction<'folder' | 'file' | null>>,
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  fileStateRef: RefObject<SelectedNodeType>,
): void {
  if (fileStateRef)
  setNewNodeType(null)
  if (newNodePromptInputRef.current) {
    newNodePromptInputRef.current.value = ''
  }
}

export function renderNewNodePromptHandler(
    newNodeType: 'folder' | 'file' | null,
    selectedNode: SelectedNodeType,
    depth: number,
    newNodePromptRef: RefObject<HTMLDivElement | null>,
    newNodePromptInputRef: RefObject<HTMLInputElement | null>,
    submitNewNodePrompt: () => Promise<void>,
    cancelNewNodePrompt: () => void
): ReactNode  {
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

export function renderNodeHandler(
  node: FsNode,
  depth: number,
  selectedNode: SelectedNodeType,
  selectNodeHandler: (node: SelectedNodeType) => void,
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode
): ReactNode {
  
  // File Node Row
  if (node.type == 'file') {
    const isSelectedFile = selectedNode.id === node.id

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
            selectNodeHandler(node)
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
  const isSelectedFolder = selectedNode.id === node.id
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
            selectNodeHandler(node)
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
            selectNodeHandler(node)
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
          {newNodeType && isSelectedFolder ? renderNewNodePrompt(depth + 1) : null}
        </ul>
      )}
    </li>
  )
}

export function renderNodeHelper2(
  node: FsNode,
  depth: number,
  selectedNode: SelectedNodeType,
  selectNodeHandler:  (node: SelectedNodeType) => void,
  fileStateRef: RefObject<SelectedNodeType>,
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode
): ReactNode {

  const isSelectedNode: boolean = selectedNode.id === node.id
  let isFileParentSelected: boolean = false
  let isExpanded: boolean = false
  let children: FsNode[] = []

  if (newNodeType && fileStateRef.current.parentId === node.id) {
    selectNodeHandler(node)
  }

  if (node.type == 'folder') {
    isExpanded = toggledFolderIds.has(node.id)
    children = node.children
  }

  return (
    <li key={node.id}>
        <div 
          {...(node.type === 'folder' ? {'folder-node-row': 'true'} : {'file-node-row': 'true'})}
          style={{ 
            paddingLeft: (node.type === 'folder' ? depth * 5 : depth * 7),
            cursor: 'pointer',
            fontWeight: isSelectedNode ? 700 : 400,
            userSelect: 'none',

            background: isSelectedNode ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
            borderRadius: 6,
            paddingTop: 2,
            paddingBottom: 2,  
        }}
        onClick={() => clickOnNodeHelper(
          node,
          isSelectedNode,
          selectNodeHandler,
          isExpanded,
          toggleFolderHandler
        )}
        >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {node.type === 'folder' && (
              <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
                {isExpanded ? '▾' : '▸'}
              </span>
            )}
            <img
              src={(node.type === 'folder' ? folderIcon : fileIcon)}
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
            {newNodeType && (isSelectedNode) ? renderNewNodePrompt(depth + 1) : null}
          </ul>
        )}

    </li> 
  )
}

function clickOnNodeHelper(
  node: FsNode, 
  isSelectedNode: boolean,
  selectNodeHandler:  (node: SelectedNodeType) => void,
  isExpanded: boolean,
  toggleFolderHandler: (nodeId: number) => void
): void {
  if (node.type === 'file') {
      // if file is already highlighted, return
      if (isSelectedNode) return
      
      // if file is unhighlighted, highlight
      if (!isSelectedNode){
        selectNodeHandler(node)
      }
  } else {
    // if folder is unfolded, but not highlighted, simply rehighlight it
    if (!isSelectedNode && isExpanded) {
      selectNodeHandler(node)
      return
    }
    
    // if folder is unfolded, and highlighted, fold and unhighlight
    if (isSelectedNode && isExpanded) {
      selectNodeHandler(EMPTY_SELECTED_NODE)
      toggleFolderHandler(node.id)
      return
    }

    // if folder is folded, and not highlighted, unfold and highlight
    if (!isSelectedNode && !isExpanded){
      selectNodeHandler(node)
      toggleFolderHandler(node.id)
    }
  }
}