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
  selectedFolder: SelectedNodeType,
  FsTree: {fsTree: FsTree},
  cancelNewNodePrompt: () => void,
  selectNodeHandler: (node: SelectedNodeType) => void, // Dispath is a function that tkaes one argument and returns void
  toggleFolderHandler: (nodeId: number) => void 
): Promise<void> {

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

  try {

    // folder where new node is to be created under
    const parentId = selectedFolder?.id ?? null
    const mimeType = computeMimeTypeFromName(trimmed)
    const res = await window.api.createFsNode(
      newNodeType, parentId, name, mimeType
    )

    // once submitted, cancel newNodePrompt
    //* Here we can consider error message later for naming, instad just canceling
    cancelNewNodePrompt()

    if (res.ok) {
      const newNode: FsNodeRow = res.node

      // append new node to the FsTree
      const newFsNode: FsNode = FsTree.fsTree.insertFsNode(newNode)
      
      // highlight newly created node
      selectNodeHandler(newFsNode)

      // if it is a folder, expand
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
          autoFocus
          ref={newNodePromptInputRef}
          placeholder={newNodeType === 'folder' ? 'Folder name' : 'File name'}
          style={{ flex: 1 }}
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
  selectNodeHandler: (node: SelectedNodeType) => void,
  // only file
  FsTree: {fsTree: FsTree},
  selectFolderHandler: (folder: SelectedNodeType) => void,
  // only folder
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode,
  // delete
  deleteNodeHandler: (deletingNode: FsNode) => void,
  // renaming
  renamingNodeId: number | null,
  renameInputRef: RefObject<HTMLInputElement | null>,
  setRenamingNodeId: Dispatch<SetStateAction<number | null>>,
  renamingNodeHandler: (renamingNode: FsNode) => void,
  cancelRenamingNode: () => void,
): ReactNode {

  // if both some file and folder are selected, only highlight folder
  const onlyFolderIsSelected = (selectedFolder && !selectedFile) ? true : false
  
  const isSelectedFile = node.id === selectedFile?.id
  const isSelectedFolder = node.id === selectedFolder?.id
  let isExpanded = false
  let children: FsNode[]= []
  if (node.type === 'folder'){
      isExpanded = toggledFolderIds.has(node.id)
      children = Array.isArray(node.children) ? node.children : []
  }
  const highlightFolderBgr = (!onlyFolderIsSelected && isSelectedFolder ? true : false)

  return (
      <li key={node.id}
      style={
        highlightFolderBgr
          ? { background: 'rgba(121, 125, 131, 0.09)', borderRadius: 5, overflow: 'hidden' }
          : undefined
      }
      >
        <div 
          tabIndex={-1} // make focusable, not tabbable
          node-row="true"
          style={{ 
            paddingLeft: (node.type === 'folder' ? depth * 5 : depth * 8),
            cursor: 'pointer',
            fontWeight: (node.type === 'folder' 
              ? (onlyFolderIsSelected && isSelectedFolder ? 700 : 400)
              : (!onlyFolderIsSelected && isSelectedFile ? 700 : 400)),
            userSelect: 'none',
            background: (node.type === 'folder' 
              ? ((onlyFolderIsSelected && isSelectedFolder) ? 'rgba(67, 102, 158, 0.18)' : 'transparent')
              : ((!onlyFolderIsSelected && isSelectedFile)  ? 'rgba(30, 91, 189, 0.18)' : 'transparent')),
            borderRadius: 5,
            paddingTop: 2,
            paddingBottom: 2,
            outline: 'none'
          }}
          onClick={() =>
            {if (node.type === 'file'){ 
              onClickFileHandler(
                node,
                isSelectedFile,
                selectedFolder,
                selectNodeHandler,
                selectFolderHandler,
                FsTree,
              )
            } 
            {if (node.type === 'folder'){
             onClickFolderHandler(
                node,
                isSelectedFolder,
                isExpanded,
                onlyFolderIsSelected,
                selectNodeHandler,
                toggleFolderHandler
              )
            }}
          }}
          // on normal selection keyDown
          onKeyDown={(e) => {
            e.stopPropagation()
            if (renamingNodeId === null) {
              if (e.key === 'Backspace') {
                deleteNodeHandler(node)
              }

              // initiate rename update
              if (e.key === 'Enter') {
                setRenamingNodeId(node.id)
              }
            }
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <img
              src={node.type === 'folder' ? folderIcon : fileIcon}
              alt=""
              aria-hidden="true"
              style={{ width: 18, height: 18, display: 'block' }}
            />
            {/* Renaming mode is activated */}
            {renamingNodeId === node.id ? (
              <input
                key={`__rename__:${node.id}`}
                ref={renameInputRef}
                defaultValue={node.name}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  // used to re-focus the node
                  const nodeEl = (e.currentTarget as HTMLElement).closest('[node-row="true"]') as HTMLElement
                  // on rename save
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    renamingNodeHandler(node)
                    setTimeout(() => nodeEl.focus(), 0)
                    return
                  }
                  // on rename escape
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelRenamingNode()
                    setTimeout(() => nodeEl.focus(), 0)
                    return
                  }
                }}
                onBlur={() => {cancelRenamingNode()}}
              />
            ): (
              <span>{node.name}</span>
            )}    
          </span>
        </div>

        {isExpanded && node.type === 'folder' ?
          <ul style={{ margin: 0, paddingLeft: 6 }}>
            {children.map((child) => renderNode(child, depth + 1))}
            {/* folder prompt */}
            {newNodeType && isSelectedFolder ? renderNewNodePrompt(depth + 1) : null}
          </ul>
          : undefined
        }

      </li>
    )
}

function onClickFileHandler (
  node: FsNode,
  isSelectedFile: boolean,
  selectedFolder: SelectedNodeType, // check if selectedFile.parentId matches this
  selectNodeHandler:  (node: SelectedNodeType) => void,
  selectFolderHandler:  (folder: SelectedNodeType) => void, // update selectedFolder
  FsTree: {fsTree: FsTree}, // to get parent Node
): void {

  // if file is already highlighted, no need to highlight
  // but make sure to update selectedFolder to its parent when
  // selectedFolder is null due to global click behavior
  if (isSelectedFile && node.parentId !== selectedFolder?.id) {
      const parentNode = FsTree.fsTree.nodes.get(node.parentId) ?? null
      selectFolderHandler(parentNode)
      return
  }
  
  // if file is unhighlighted, highlight
  if (!isSelectedFile){
    selectNodeHandler(node)
  }
}

function onClickFolderHandler(
  node: FsNode,
  isSelectedFolder: boolean,
  isExpanded: boolean,
  onlyFolderIsSelected: boolean,
  selectNodeHandler:  (node: SelectedNodeType) => void,
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
