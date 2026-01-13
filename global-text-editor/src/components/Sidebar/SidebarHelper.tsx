import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FsNode, FsNodeRow} from "../../context/FsTreeContext/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'
import type { FsTree } from  "../../context/FsTreeContext/FsTree"
import { computeMimeTypeFromName } from "./MimeType"

// define selectedNode type
export type SelectedNodeType = FsNode | null

export async function submitNewNodePromptHandler(
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  newNodeType: 'folder' | 'file' | null,
  cancelNewNodePrompt: () => void,
  selectedFolder: SelectedNodeType,
  selectFileHandler: (node: SelectedNodeType) => void, // Dispath is a function that tkaes one argument and returns void
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

    // new node can only be created under selectedFolder or root
    const parentId = selectedFolder?.id ?? null
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
      selectFileHandler(newFsNode)

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
): void {
  setNewNodeType(null)
  if (newNodePromptInputRef.current) {
    newNodePromptInputRef.current.value = ''
  }
}

export function renderNewNodePromptHandler(
    newNodeType: 'folder' | 'file' | null,
    selectedFolder: SelectedNodeType,
    depth: number,
    newNodePromptRef: RefObject<HTMLDivElement | null>,
    newNodePromptInputRef: RefObject<HTMLInputElement | null>,
    submitNewNodePrompt: () => Promise<void>,
    cancelNewNodePrompt: () => void
): ReactNode  {
  if (!newNodeType) return null

  return (
    <li key={`__create_new_node_under__:${selectedFolder?.id ?? 'root'}:${newNodeType}`}>
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
  selectedFile: SelectedNodeType,
  selectedFolder: SelectedNodeType,
  selectNodeHandler:  (node: SelectedNodeType) => void,
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode
): ReactNode {

  const fileIsSelected: boolean = selectedFile != null
  const folderIsSelected: boolean = selectedFolder != null
  // if both some file and folder are selected, only highlight folder
  let onlyFolderIsSelected: boolean = false
  if (folderIsSelected && !fileIsSelected) {
    onlyFolderIsSelected = true
  } 
  
  // File Node Row
  if (node.type == 'file') {
    const isSelectedFile = selectedFile?.id === node.id

    return (
      <li key={node.id}>
        <div 
          file-node-row="true"
          style={{ 
            paddingLeft: depth * 7,
            cursor: 'pointer',
            fontWeight: (!onlyFolderIsSelected && isSelectedFile ? 700 : 400),
            userSelect: 'none',
            background: (!onlyFolderIsSelected && isSelectedFile 
            ? 'rgba(67, 102, 158, 0.18)' : 'transparent'),
            borderRadius: 6,
            paddingTop: 2,
            paddingBottom: 2,  
        }}
        onClick={() => clickFileHelper(
          node,
          isSelectedFile,
          selectNodeHandler
        )}
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
  const isSelectedFolder = selectedFolder?.id === node.id
  const isExpanded = toggledFolderIds.has(node.id)
  const children = Array.isArray(node.children) ? node.children : []
  let highlightFolderBgd
  if (!onlyFolderIsSelected && isSelectedFolder){
    highlightFolderBgd = true
  }
   
  return (
    <ul key={node.id} style={{
       background: (highlightFolderBgd ? 'rgba(121, 125, 131, 0.09)' : 'transparent')
    }}>
      <div
        folder-node-row="true"
        style={{
          paddingLeft: depth * 5,
          cursor: 'pointer',
          fontWeight: (onlyFolderIsSelected && isSelectedFolder ? 700 : 400),
          userSelect: 'none',
          background:
            (onlyFolderIsSelected && isSelectedFolder)
              ? 'rgba(67, 102, 158, 0.18)'
              : 'transparent',
          borderRadius: 6,
          paddingTop: 2,
          paddingBottom: 2,
        }}
        onClick={() => clickFolderHelper(
          node,
          isSelectedFolder,
          onlyFolderIsSelected,
          selectNodeHandler,
          isExpanded,
          toggleFolderHandler
        )}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
            {isExpanded ? '▾' : '▸'}
          </span>
          <img
            src={folderIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 18, height: 18, display: 'block',
              background: (highlightFolderBgd ? 'rgba(129, 155, 198, 0.18)' : 'transparent')
            }}
          />
          <span>{node.name}</span>
        </span>
      </div>

      {/* recursively render children node */}
      {isExpanded && (
        <ul style={{ 
          margin: 0, 
          paddingLeft: 6,
          }}>
          {children.map((child) => renderNode(child, depth + 1))}

          {/* folder prompt */}
          {newNodeType && isSelectedFolder ? renderNewNodePrompt(depth + 1) : null}
        </ul>
      )}
    </ul>
  )
}

function clickFileHelper(
  node: FsNode,
  isSelectedFile: boolean,
  selectNodeHandler:  (node: SelectedNodeType) => void,
): void {
  // if file is already highlighted, return
  if (isSelectedFile) return
  
  // if file is unhighlighted, highlight
  if (!isSelectedFile){
    selectNodeHandler(node)
  }
}

function clickFolderHelper(
  node: FsNode,
  isSelectedFolder: boolean,
  onlyFolderIsSelected: boolean,
  selectNodeHandler:  (node: SelectedNodeType) => void,
  isExpanded: boolean,
  toggleFolderHandler: (nodeId: number) => void
): void {

  // if folder is collapsed -> highlight & open
  if (!isSelectedFolder && !isExpanded) {
    selectNodeHandler(node)
    toggleFolderHandler(node.id)
    return
  }

  // both file and folder are null, but folder is open -> highlight folder
  if (!onlyFolderIsSelected && !isSelectedFolder && isExpanded) {
    selectNodeHandler(node)
    return
  }

  // some file is selected and highlighted, -> highlight folder
  if (!onlyFolderIsSelected && isSelectedFolder && isExpanded) {
    selectNodeHandler(node)
    return
  }

  // no file is selected, but this folder is not highlight, and open -> highlight folder
  if (onlyFolderIsSelected && !isSelectedFolder && isExpanded) {
    selectNodeHandler(node)
    return
  }
    
  // no file is selected, but this folder is highlight, and open -> unhighlight and fold
  if (onlyFolderIsSelected && isSelectedFolder && isExpanded) {
    selectNodeHandler(null)
    toggleFolderHandler(node.id)
    return
  }

}

