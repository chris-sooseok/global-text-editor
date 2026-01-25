import { type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react"
import type { FileNode, FolderNode, FsNode, FsNodeRow} from "store/FsTreeStore/FsTreeTypes"
import type { SelectedNodeType, DragState } from "./Sidebar"
import folderIcon from 'assets/Sidebar/icons8-folder-96.png'
import fileIcon from 'assets/Sidebar/icons8-file-96.png'
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
    const mimeType = null
    const fileType = (newNodeType === 'file' ? "normal" : null)
    const res = await window.api.createFsNode(
      newNodeType, parentId, name, mimeType, fileType
    )

    // once submitted, cancel newNodePrompt
    cancelNewNodePrompt()

    if (res.ok) {
      const newNode: FsNodeRow = res.row

      // ! ipc and store are separate since we need to pass FsNode only to selectNodeHandler
      const newFsNode: FsNode = FsTreeStore.getState().insertFsNode(newNode)
      
      // highlight newly created node
      selectNodeHandler(newFsNode)

      // if it is a folder, expand
      if (newNode.type === 'folder') {
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
          maxLength={50}
          placeholder={newNodeType === 'folder' ? 'Folder name' : 'File name'}
          className="
            flex-1 w-0 min-w-[120px]
            bg-transparent
            border-0 outline-none
            focus:outline-none
            pl-1
          "
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
  // dragging
  dragState: DragState | null,
  onPointerDownNode: (e: React.PointerEvent, node: FsNode) => void,
): ReactNode {

  const { fileFontSize, sidebarNodeBgr, sidebar_node_drag_target } = ThemeManagerStore.getState()

  // if both some file and folder are selected, only highlight folder
  const onlyFolderIsSelected = (selectedFolder && !selectedFile) ? true : false
  const isSelectedFile = node.id === selectedFile?.id
  const isSelectedFolder = node.id === selectedFolder?.id

  let isExpanded = false
  let children: FsNode[]= []
  if (node.type === 'folder'){
      isExpanded = toggledFolderIds.has(node.id)
      children = node.children ?? []
  }

  const dropPosition = dragState?.dropPosition
  const isDropTargetFolder = (node.type === 'folder' && node.id === dragState?.targetNodeId
    && node.id === dragState?.targetParentId)
  const isDropTargetNode = (node.id === dragState?.targetNodeId 
    && node.parentId === dragState?.targetParentId)

  const isDraggingNode = dragState?.draggingNode?.id === node.id

  return (
      <li key={node.id}
        style={{
          paddingLeft: (node.type === 'folder' ? depth * 15 : depth * 11),
          userSelect: "none",
        }}
      >
        {/* Node Logics */}
        <div 
          tabIndex={-1} // make focusable, not tabbable
          data-node-id={node.id}
          style={{ 
            cursor: 'pointer',
            fontWeight: (node.type === 'folder' 
              ? (onlyFolderIsSelected && isSelectedFolder ? 700 : 400)
              : (!onlyFolderIsSelected && isSelectedFile ? 700 : 400)),
            background: (node.type === 'folder' 
            ? ((onlyFolderIsSelected && isSelectedFolder) ? sidebarNodeBgr : 'transparent')
            : ((!onlyFolderIsSelected && isSelectedFile)  ? sidebarNodeBgr : 'transparent')),
            borderRadius: 1,
            padding: "2px 0px" ,
            opacity: isDraggingNode ? 0.35 : 1,
            outline: (isDropTargetFolder && dropPosition === "inside" ? sidebar_node_drag_target: "none"),
            borderBottom: (isDropTargetNode && dropPosition === "after" ? sidebar_node_drag_target: "none"),
            borderTop: (isDropTargetNode && dropPosition === "before" ? sidebar_node_drag_target : "none")
          }}
          onClick={() =>
            // File selection logic
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
          // on remove or rename initiate -> activation below
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
          // Allow setting folder to root
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
          {/* Node Logo and Name Container */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%' }}>
            {node.type === 'folder' 
              ? <span aria-hidden="true" style={{ width: 12, display: 'inline-block' }}>
                    {isExpanded ? '▾' : '▸'}
                </span>
              : undefined}
            <ToolbarIcon
              whiteIcon={node.type === 'folder' ? folderIcon : fileIcon}
              onlyWhiteIcon={true}
            />

            {/* Renaming mode is activated */}
            {renameNodeId === node.id ? (
              <input
                key={`__rename__:${node.id}`}
                ref={renameInputRef}
                autoFocus
                onFocus={(e) => {
                  e.currentTarget.select()
                }}
                className="
                  flex-1 w-0 min-w-[120px]
                  bg-transparent
                  border-0 outline-none
                  focus:outline-none
                  pl-1
                "
                defaultValue={node.name}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  // to re-focus the node; this is different from selectNodeHandler
                  const nodeEl = (e.currentTarget as HTMLElement).closest(`[data-node-id="${node.id}"]`) as HTMLElement | null
                  // on rename save
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (renameInputRef.current) {
                      renameNodeHandler(node, renameInputRef.current.value)
                    }
                    setTimeout(() => nodeEl?.focus(), 0)
                    return
                  }
                  // on rename escape
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setRenameNodeId(null)
                    if (renameInputRef.current) renameInputRef.current.value = ''
                    setTimeout(() => nodeEl?.focus(), 0)
                    return
                  }
                }}
                // clicking outside cancels rename, or on save as losing focus
                onBlur={() => {
                  setRenameNodeId(null)
                  if (renameInputRef.current) renameInputRef.current.value = ''
                }}
              />
            ): (
              <span style={{ 
                flex: 1, 
                minWidth: 0, 
                overflow: 'hidden', 
                whiteSpace: 'nowrap',
                fontSize: fileFontSize
              }}>
                {node.name}
              </span>
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
