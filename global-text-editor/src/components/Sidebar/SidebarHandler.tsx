import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FileNode, FolderNode, FsNode, FsNodeRow} from "store/FsTreeStore/FsTreeTypes"
import type { SelectedNodeType, DragState } from "./Sidebar"
import folderIcon from 'assets/Sidebar/icons8-folder-96.png'
import fileIcon from 'assets/Sidebar/icons8-file-96.png'
import rightIcon from "assets/Sidebar/icons8-right-white-96.png"
import downIcon from "assets/Sidebar/icons8-dropdown-white-96.png"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import { FsTreeStore } from "store/FsTreeStore/FsTreeStore"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import ToolbarIcon from "shared/ToolbarIcon"

export async function submitNewNodePromptHandler(
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  newNodeType: 'folder' | 'file' | null,
  selectedFolder: SelectedNodeType,
  cancelNewNodePrompt: () => void,
  selectNodeHandler: (node: FsNode) => void, // Dispath is a function that tkaes one argument and returns void
  toggleFolderHandler: (nodeId: number) => void 
): Promise<void> {

  const { insertFsNodeRow } = FsTreeStore.getState()

  try {
    if (!newNodeType || !newNodePromptInputRef.current) return
    if (newNodePromptInputRef.current.value.trim() === '') return

    const name = newNodePromptInputRef.current.value
    //? if selectedFolder is null, create it at the root level
    const parentId = selectedFolder?.id ?? 0

    const res = await window.api.createFsNode(newNodeType, parentId, name)

    if (res.ok) {
      const newNode: FsNodeRow = res.row
      const newFsNode: FsNode = insertFsNodeRow(newNode)
      selectNodeHandler(newFsNode)

      // Toggle Folder Node
      if (newNode.type === "folder") toggleFolderHandler(newNode.id)
      
    } else {
      console.error(res.message)
    }

  } catch (err) {
    console.error(err)
  } finally {
    cancelNewNodePrompt()
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
    <li key={`__create_new_node_under__:${selectedFolder?.id ?? 'root'}:${newNodeType}`}
      style={{
        paddingLeft: depth * 8,
      }}
    >
      <div
        ref={newNodePromptRef}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          width: '100%'
        }}
      >
        <ToolbarIcon
          whiteIcon={newNodeType === 'folder' ? folderIcon : fileIcon}
          onlyWhiteIcon={true}
        />
        {/* New Node Prompt Input */}
        <input
          autoFocus
          ref={newNodePromptInputRef}
          maxLength={50}
          placeholder={newNodeType === 'folder' ? 'Folder name' : 'File name'}
          style={{
            flex: 1,
            width: 0,
            minWidth: 120,
            background: "transparent",
            outline: "none",
            paddingLeft: 2
          }}
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
          onBlur={() => {cancelNewNodePrompt()}}
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
  selectNodeHandler: (node: FsNode) => void,
  // only file
  nodes: Map<number, FsNode>,
  selectFolderHandler: (folder: FolderNode | null) => void,
  // only folder
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
  toggledFolderIds: Set<number>,
  toggleFolderHandler: (nodeId: number) => void,
  renderNewNodePrompt: (depth: number) => ReactNode,
  // delete
  removeNodeHandler: (deletingNode: FsNode) => void,
  // renaming
  renameNodeId: number | null,
  renameInputRef: RefObject<HTMLInputElement | null>,
  setRenameNodeId: Dispatch<SetStateAction<number | null>>,
  renameNodeHandler: (renameNode: FsNode, newName: string) => void,
  cancelRenameHandler: () => void,
  // dragging
  dragState: DragState | null,
  onPointerDownNode: (e: React.PointerEvent, node: FsNode) => void,
): ReactNode {

  const { nodeFontSize, sidebarNodeBgr, sidebar_node_drag_target } = ThemeManagerStore.getState()

  // Highlight Logics
  const onlyFolderIsSelected = (selectedFolder && !selectedFile) ? true : false
  const isSelectedFile = node.id === selectedFile?.id
  const isSelectedFolder = node.id === selectedFolder?.id

  // Folder Nodes
  const isExpanded = node.type === "folder" && toggledFolderIds.has(node.id)
  const children = node.type === "folder" ? (node.children ?? []) : []

  // Dragging
  const dropPosition = dragState?.dropPosition
  const isDropTargetFolder = 
    node.type === 'folder' && 
    node.id === dragState?.targetNodeId && 
    node.id === dragState?.targetParentId
  const isDropTargetNode = 
    node.id === dragState?.targetNodeId && 
    node.parentId === dragState?.targetParentId
  const isDraggingNode = dragState?.draggingNode?.id === node.id


  return (
      <li key={node.id}>
        {/* FsNode */}
        <div 
          tabIndex={-1}
          data-node-id={node.id}
          style={{ 
            cursor: 'pointer',
            borderRadius: 2,
            marginLeft: (depth === 0 ? "2px" : depth * 23),
            marginRight: "2px",
            marginTop: "2px",
            marginBottom: "2px",
            // Highlight Styles
            fontWeight: (node.type === 'folder' 
              ? (onlyFolderIsSelected && isSelectedFolder ? 700 : 400)
              : (!onlyFolderIsSelected && isSelectedFile ? 700 : 400)),
            background: (node.type === 'folder' 
              ? ((onlyFolderIsSelected && isSelectedFolder) ? sidebarNodeBgr : 'transparent')
              : ((!onlyFolderIsSelected && isSelectedFile)  ? sidebarNodeBgr : 'transparent')),
            // Dragging Styles
            opacity: isDraggingNode ? 0.35 : 1,
            outline: (isDropTargetFolder && dropPosition === "inside" ? sidebar_node_drag_target: "none"),
            borderBottom: (isDropTargetNode && dropPosition === "after" ? sidebar_node_drag_target: "none"),
            borderTop: (isDropTargetNode && dropPosition === "before" ? sidebar_node_drag_target : "none")
          }}
          // FsNode onClick
          onClick={() =>
            {if (node.type === 'file'){ 
              onClickFileHandler(
                node,
                isSelectedFile,
                selectedFolder,
                selectNodeHandler,
                selectFolderHandler,
                nodes,
              )
            }
            // Folder selection logic
            {if (node.type === 'folder'){
             onClickFolderHandler(
                node,
                isSelectedFolder,
                isExpanded,
                onlyFolderIsSelected,
                selectNodeHandler,
                selectFolderHandler,
                toggleFolderHandler
              )
            }}
          }}
          // FsNode KeyDown For Rename and Remove
          onKeyDown={(e) => {
            e.stopPropagation()
            if (renameNodeId === null) {
              if (e.key === 'Backspace') {
                removeNodeHandler(node)
              }

              // initiate rename update
              if (e.key === 'Enter') {
                setRenameNodeId(node.id)
              }
            }
          }}
          // FsNode onBlur
          // Allow Setting Folder to Root
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null
            const clickedIconButton = !!next?.closest('[data-new-node-btn="true"]')
            // focus on other node should not set folder to null
            const focusWentToNode = !!next?.closest?.('[data-node-id]')
            if (!clickedIconButton && !focusWentToNode && selectedFolder) selectFolderHandler(null)
          }}
          // Dragging
          onPointerDown={(e) => onPointerDownNode(e, node)}
        >
          {/* FsNode Logo and Name Container */}
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            width: '100%' 
          }}>

            {node.type === 'folder' 
              ? <ToolbarIcon 
                whiteIcon={isExpanded ? downIcon : rightIcon}
                onlyWhiteIcon={true}
                
              />
              : undefined
            }
            {/* FsNode Icon */}
            { node.type === 'file' 
              ? <ToolbarIcon
              whiteIcon={fileIcon}
              onlyWhiteIcon={true}
            />
            : undefined
            
            }


            {/* FsNode Name or Rename Prompt */}
            {renameNodeId !== node.id 
            ? (
              <span style={{ 
                flex: 1,
                minWidth: 0,
                overflow: 'hidden', 
                whiteSpace: 'nowrap',
                fontSize: nodeFontSize
              }}>
                {node.name}
              </span>
            ) : (
              <input
                key={`__rename__:${node.id}`}
                ref={renameInputRef}
                autoFocus
                onFocus={(e) => {
                  e.currentTarget.select()
                }}
                style={{
                  flex: 1,
                  width: 0,
                  minWidth: 120,
                  background: "transparent",
                  outline: "none",
                  paddingLeft: 2,
                }}
                defaultValue={node.name}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key !== "Enter" && e.key !== "Escape") return
                  // Allow Refocusing Node; dont delete this
                  const nodeEl = (e.currentTarget as HTMLElement).closest(`[data-node-id="${node.id}"]`) as HTMLElement | null
                  e.preventDefault()
                  // on rename save
                  if (e.key === 'Enter') {
                    if (renameInputRef.current) {
                      renameNodeHandler(node, renameInputRef.current.value)
                    }
                  } else {
                    cancelRenameHandler()
                  }               
                  setTimeout(() => nodeEl?.focus(), 0)
                }}
                // Rename Cancel Blur
                onBlur={() => {
                  cancelRenameHandler()
                }}
              />
              
            )}    

          </span>
        </div>
        
        {/** Show Children Nodes If Folder is expanded */}
        {isExpanded && node.type === 'folder' ?
          <ul style={{ margin: 0, paddingLeft: 0}}>
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
  selectNodeHandler:  (node: FsNode) => void,
  selectFolderHandler: (folder: FolderNode | null) => void,
  nodes: Map<number, FsNode>, // to get parent Node
): void {

  // if file is already highlighted, no need to highlight
  // but make sure to update selectedFolder to its parent when
  if (isSelectedFile && node.parentId !== selectedFolder?.id) {
      // still trigger opening file 
      TabManagerStore.getState().openFileInActiveTab(node as FileNode)

      const parentNode = nodes.get(node.parentId) as FolderNode ?? null
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
  selectNodeHandler:  (node: FsNode) => void,
  selectFolderHandler: (folder: FolderNode | null) => void,
  toggleFolderHandler: (nodeId: number) => void,
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
    selectFolderHandler(null)
    toggleFolderHandler(node.id)
    return
  }

}

