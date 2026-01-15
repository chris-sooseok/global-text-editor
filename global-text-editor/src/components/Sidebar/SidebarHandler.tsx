import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FsNode, FsNodeRow} from "../../context/FsTreeContext/FsTreeTypes"
import folderIcon from '../../assets/icons8-folder-96.png'
import fileIcon from '../../assets/icons8-file-96.png'
import type { FsTree } from  "../../context/FsTreeContext/FsTree"
import { computeMimeTypeFromName } from "./MimeType"

// define selectedNode type
export type SelectedNodeType = FsNode | null
const SELECTED_FOLDER_KEY = String(import.meta.env.VITE_SELECTED_FOLDER_KEY)

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
    const isRoot = parentId === null ? true : false
    const mimeType = computeMimeTypeFromName(trimmed)
    const res = await window.api.createFsNode(
      isRoot, newNodeType, parentId, name, mimeType
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

//* When cancel to happen, consider also adding error msgs
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
  selectNodeHandler:  (node: SelectedNodeType) => void,
  // only file
  FsTree: {fsTree: FsTree},
  setSelectedFolder: (node: SelectedNodeType) => void,
  // only folder
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode,
  // renaming
  // renamingNodeId: number | null,
  // renamingValue: string,
  // renameInputRef: RefObject<HTMLInputElement | null>,
  // setRenamingValue: Dispatch<SetStateAction<string>>,
  // setRenamingNodeId: Dispatch<SetStateAction<number | null>>,
  // cancelRenamingNode: () => void,
): ReactNode {

  const fileIsSelected: boolean = selectedFile != null
  const folderIsSelected: boolean = selectedFolder != null
  // if both some file and folder are selected, only highlight folder
  let onlyFolderIsSelected: boolean = (folderIsSelected && !fileIsSelected ? true : false)
  
  // File Node Row
  if (node.type === 'file') {
    const isSelectedFile = node.id === selectedFile?.id

    return (
      <li key={node.id}>
        <div 
          tabIndex={0}
          file-node-row="true"
          {...(node.parentId === null ? { 'root-file-node-row': 'true' } : {})}
          style={{ 
            paddingLeft: depth * 8,
            cursor: 'pointer',
            fontWeight: (!onlyFolderIsSelected && isSelectedFile ? 700 : 400),
            userSelect: 'none',
            background: (!onlyFolderIsSelected && isSelectedFile 
              ? 'rgba(30, 91, 189, 0.18)' : 'transparent'),
            borderRadius: 5,
            paddingTop: 2,
            paddingBottom: 2,
            outline: 'none'
        }}
        onClick={() =>
          onClickFile(
                node,
                isSelectedFile,
                selectedFolder,
                selectNodeHandler,
                setSelectedFolder,
                FsTree,
              )
        }
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            keydownOnDeleteNode(node)
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
            {/* {renamingNodeId === node.id ? (
              <input
                ref={renameInputRef}
                value={renamingValue}
                onChange={(e) => setRenamingValue(e.target.value)} // live update as you type
                onBlur={() => setRenamingNodeId(null)} // exit rename mode when user clicks away (you can change later)
              />
            ) : ( */}
              <span>{node.name}</span>
            {/* )} */}
          </span>
        </div>
      </li>
    )
  }

  // Folder Node Row
  const isSelectedFolder = node.id === selectedFolder?.id
  const isExpanded = toggledFolderIds.has(node.id)
  const children = Array.isArray(node.children) ? node.children : []
  const highlightFolderBgr = (!onlyFolderIsSelected && isSelectedFolder ? true : false)

  return (
    <li key={node.id} style={{
      background: (highlightFolderBgr ? 'rgba(121, 125, 131, 0.09)' : 'transparent'),
      borderRadius: 5,
      overflow: 'hidden'
    }}>
      <div
        tabIndex={0}
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
          borderRadius: 5,
          paddingTop: 2,
          paddingBottom: 2,
          outline: 'none'
        }}
        onClick={() => onClickFolder(
          node,
          isSelectedFolder,
          isExpanded,
          onlyFolderIsSelected,
          selectNodeHandler,
          toggleFolderHandler
        )}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            keydownOnDeleteNode(node)
          }
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
          <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
            {isExpanded ? '▾' : '▸'}
          </span>
          <img
            src={folderIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 18, height: 18, display: 'block'}}
          />
          {/* {renamingNodeId === node.id ? (
            <input
              ref={renameInputRef}
              value={renamingValue}
              onChange={(e) =>{
                console.log('hell yea')
                setRenamingValue(e.target.value) // live update as you type
              }}
              onBlur={() => setRenamingNodeId(null)} // exit rename mode when clicks away
              onKeyDown={(e) => {
                if (e.key === 'Escape'){
                  cancelRenamingNode()
                }
              }}
            />
          ) : ( */}
            <span>{node.name}</span>
          {/* )} */}
        </span>
      </div>

      {/* recursively render children node */}
      {isExpanded && (
        <ul style={{ margin: 0, paddingLeft: 6 }}>
          {children.map((child) => renderNode(child, depth + 1))}

          {/* folder prompt */}
          {newNodeType && isSelectedFolder ? renderNewNodePrompt(depth + 1) : null}
        </ul>
      )}
    </li>
  )
}

function onClickFile (
  node: FsNode,
  isSelectedFile: boolean,
  selectedFolder: SelectedNodeType, // check if selectedFile.parentId matches this
  selectNodeHandler:  (node: SelectedNodeType) => void,
  setSelectedFolder:  (node: SelectedNodeType) => void, // update selectedFolder
  FsTree: {fsTree: FsTree}, // to get parent Node
): void {

  // if file is already highlighted, no need to highlight
  // but make sure to update selectedFolder to its parent when
  // selectedFolder is null due to global click behavior
  if (isSelectedFile && node.parentId != selectedFolder?.id) {
      const parentNode = FsTree.fsTree.nodes.get(node.parentId) ?? null
      setSelectedFolder(parentNode)
      localStorage.setItem(SELECTED_FOLDER_KEY, JSON.stringify(parentNode))
      return
  }

  
  // if file is unhighlighted, highlight
  if (!isSelectedFile){
    selectNodeHandler(node)
  }
}

function onClickFolder(
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


function keydownOnDeleteNode(deletingNode: FsNode) {
  const ok = window.confirm(`Confirm to delete \n ${deletingNode.name}`)
  console.log(ok)
}
