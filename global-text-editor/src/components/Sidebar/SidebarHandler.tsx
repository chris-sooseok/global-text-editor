import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FileNode, FolderNode, FsNode, FsNodeRow} from "store/FsTreeStore/FsTreeTypes"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import { SidebarStore } from "store/FsTreeStore/SidebarStore"
import type { DragState } from "./Sidebar"
import ToolbarIcon from "shared/ToolbarIcon"
import folderIcon from 'assets/Sidebar/icons8-folder-96.png'
import fileIcon from 'assets/Sidebar/icons8-file-96.png'
import rightIcon from "assets/Sidebar/icons8-right-white-96.png"
import downIcon from "assets/Sidebar/icons8-dropdown-white-96.png"

export async function submitNewNodePromptHandler(
  activeFolder: FolderNode | null,
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  newNodeType: 'folder' | 'file' | null,
  cancelNewNodePrompt: () => void,
): Promise<void> {

  const { insertFsNodeRow } = SidebarStore.getState()

  try {
    if (!newNodeType || !newNodePromptInputRef.current) return
    if (newNodePromptInputRef.current.value.trim() === '') return

    const name = newNodePromptInputRef.current.value
    // if selectedFolder is null, create it at the root level
    const parentId = activeFolder?.id ?? 0
    const res = await window.api.createFsNode(newNodeType, parentId, name)
    if (res.ok) {
      const newNode: FsNodeRow = res.row
      const newFsNode: FsNode = insertFsNodeRow(newNode)
      // focus on the newly created node
      setTimeout(() => {
        const el = document.querySelector( `[data-node-id="${newFsNode.id}"]`) as HTMLElement | null
        el?.focus()
      }, 0)
      
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
  depth: number,
  activeFolder: FolderNode | null,
  newNodePromptRef: RefObject<HTMLDivElement | null>,
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  submitNewNodePrompt: () => Promise<void>,
  cancelNewNodePrompt: () => void
): ReactNode  {
  if (!newNodeType) return null

  return (
    <li key={`__create_new_node_under__:${activeFolder?.id ?? 'root'}:${newNodeType}`}
      style={{
        paddingLeft: depth * 23,
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
  activeFile: FileNode | null,
  activeFolder: FolderNode | null,
  // folder
  toggledFolderIds: Set<number>,
  renderNode: (node: FsNode, depth?: number) => ReactNode,
  newNodeType: 'folder' | 'file' | null,
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

  const { setActiveFile, setActiveFolder } = SidebarStore.getState()

  const { nodeFontSize, sidebarNodeBgr, sidebar_node_drag_target } = ThemeManagerStore.getState()

  // Highlight Logics
  const onlyFolderIsActive = (activeFolder && !activeFile) ? true : false
  const isActiveFile = node.id === activeFile?.id
  const isActiveFolder = node.id === activeFolder?.id

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
              ? (onlyFolderIsActive && isActiveFolder ? 700 : 400)
              : (!onlyFolderIsActive && isActiveFile ? 700 : 400)),
            background: (node.type === 'folder' 
              ? ((onlyFolderIsActive && isActiveFolder) ? sidebarNodeBgr : 'transparent')
              : ((!onlyFolderIsActive && isActiveFile)  ? sidebarNodeBgr : 'transparent')),
            // Dragging Styles
            opacity: isDraggingNode ? 0.35 : 1,
            outline: (isDropTargetFolder && dropPosition === "inside" ? sidebar_node_drag_target: "none"),
            borderBottom: (isDropTargetNode && dropPosition === "after" ? sidebar_node_drag_target: "none"),
            borderTop: (isDropTargetNode && dropPosition === "before" ? sidebar_node_drag_target : "none")
          }}
          // FsNode onClick
          onClick={() =>
            {if (node.type === 'file'){ 
              setActiveFile(node as FileNode)
            }
            // Folder selection logic
            {if (node.type === 'folder'){
              setActiveFolder(node as FolderNode)
            }}
          }}
          // FsNode KeyDown for rename or remove
          onKeyDown={(e) => {
            e.stopPropagation()
            if (renameNodeId === null) {
              if (e.key === 'Backspace') {
                removeNodeHandler(node)
              }
              if (e.key === 'Enter') {
                setRenameNodeId(node.id)
              }
            }
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
            {/* Folder Icon */}
            {node.type === 'folder' 
              ? <ToolbarIcon 
                whiteIcon={isExpanded ? downIcon : rightIcon}
                onlyWhiteIcon={true}
              />
              : undefined
            }
            {/* File Icon */}
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
            {newNodeType && isActiveFolder ? renderNewNodePrompt(depth + 1) : null}
          </ul>
          : undefined
        }
      </li>
    )
}

