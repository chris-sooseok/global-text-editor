import { useState, useEffect, useRef, useMemo } from 'react'
import { FsTreeStore } from '../../store/FsTreeStore/FsTreeStore'
import { buildFsTree } from '../../store/FsTreeStore/FsTreeStoreHelper'
import { TabManagerStore } from '../../store/TabManagerStore/TabManagerStore'
import type { FileNode, FolderNode, FsNode } from '../../store/FsTreeStore/FsTreeTypes'
import { 
  submitNewNodePromptHandler,  
  renderNewNodePromptHandler,
  renderNodeHandler,
} from './SidebarHandler'
import newFolderIcon from 'assets/Sidebar/icons8-add-folder-96.png'
import newFileIcon from 'assets/Sidebar/icons8-add-file-96.png'
import { parseLocalStorage } from 'shared/parseLocalStorage'
import ToolbarIcon from 'shared/ToolbarIcon'
import { ThemeManagerStore } from 'store/ThemeStore/ThemeManagerStore'

const SIDEBAR_SELECTED_FILE = String(import.meta.env.VITE_SIDEBAR_SELECTED_FILE)
const SIDEBAR_SELECTED_FOLDER = String(import.meta.env.VITE_SIDEBAR_SELECTED_FOLDER)
const SIDEBAR_TOGGLED_FOLDERS = String(import.meta.env.VITE_SIDEBAR_TOGGLED_FOLDERS)

export type SelectedNodeType = FsNode | null

export type DragState = {
    draggingNode: FsNode
    x: number
    y: number
    targetNodeId: number | null
    targetParentId: number | null
    dropPosition: "before" | "inside" | "after"
  }

function Sidebar() {
  const { fileFontSize } = ThemeManagerStore.getState()

  const nodeRows = FsTreeStore((s) => s.nodeRows)
  const loadFsNodes = FsTreeStore((s) => s.loadFsNodes)
  const { roots, nodes } = useMemo(() => buildFsTree(nodeRows), [nodeRows])
  
  /** ensure loading fsTree when mounting sidebar */
  useEffect(() => {
    void loadFsNodes(window.api)
  }, [loadFsNodes])

  /** Folder Toggle and Highlight Logics */
  const [toggledFolderIds, setToggledFolderIds] = useState<Set<number>>(() => {
    // localStorage only supports arr, so we make sure to conver to Set
    const arr = parseLocalStorage<number[]>
    (localStorage.getItem(SIDEBAR_TOGGLED_FOLDERS), [])
    return new Set(arr)
  })

  /**  Separate states for selected file and folder to control highlight behaviors */
  const [selectedFile, setSelectedFile ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>
    (localStorage.getItem(SIDEBAR_SELECTED_FILE), null)
  })
  
  const [selectedFolder, setSelectedFolder ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>
    (localStorage.getItem(SIDEBAR_SELECTED_FOLDER), null)
  })

  /** FsTree Manipulation */
  const [renameNodeId, setRenameNodeId] = useState<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  const { renameFsNode, removeFsNode, moveFsNode } = FsTreeStore.getState()

  /** Interaction with Tabs */
  const { openFileInActiveTab, renameFileInTab, closeFileInTab } = TabManagerStore.getState()
  const tabIdsByFileIds = TabManagerStore((s) => s.tabIdsByFileIds)

  const [dragState, setDragState] = useState<DragState | null>(null)
  const dragNodeRef = useRef<{draggingNode: FsNode, startX: number, startY: number} | null>(null)

  /** Used for new node creation
   * newNodeType should be set to some type only when prompt is to be displayed
   * Unless some node is to be created, they all should be set to null */
  const [newNodeType, setNewNodeType] = useState<'folder' | 'file' | null>(null)
  const newNodePromptRef = useRef<HTMLDivElement | null>(null)
  const newNodePromptInputRef = useRef<HTMLInputElement | null>(null)

  /** Folder Toggle and Highlight Logics */
  function toggleFolderHandler(nodeId: number) {
    setToggledFolderIds((prev) => {
      const next = new Set(prev) // create a new Set so React sees a new reference
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      localStorage.setItem(SIDEBAR_TOGGLED_FOLDERS, JSON.stringify(Array.from(next)))
      return next
    })
  }

  /** 
   * Based on node selected (file or folder), highlight them
   * Also this is used to unhighlight folder for global click behavior: else case */ 
  function selectNodeHandler(node: FsNode) {

    if (node?.type === 'file') {
      const nextSelectedFile: FsNode = node    
      selectFileHandler(nextSelectedFile)
      
      //* We make separate check conditions to prevent state update on every selection
      // when a root file is created or selected
      if (nextSelectedFile.parentId === null) { 
        if (!selectedFolder) selectFolderHandler(null)
      }
      // when normal file is selected, update selectedFolder to its parent
      if (nextSelectedFile.parentId !== selectedFolder?.id){
        const parentId = node.parentId
        const parentNode = parentId === null ? null : nodes.get(parentId)
        if (parentNode && parentNode.type === 'folder') {
          selectFolderHandler(parentNode)
        } else {
          selectFolderHandler(null)
        }
      }
    } 
    
    if (node?.type === 'folder') {
      const nextSelectedFolder: FsNode = node
      // when folder is selected, nullify file so that folder is highlighted
      selectFileHandler(null)
      selectFolderHandler(nextSelectedFolder)
    }

    // ensure to focus when new node is created
    setTimeout(() => {
      // find the element to set focus
      const el = document.querySelector( `[data-node-id="${node.id}"]`) as HTMLElement | null
      el?.focus()
    }, 0)

  }

  function selectFileHandler(file: FileNode | null) {
    setSelectedFile(file)
    localStorage.setItem(SIDEBAR_SELECTED_FILE, JSON.stringify(file))
    if (!file) return
    openFileInActiveTab(file)
  }

  function selectFolderHandler(folder: FolderNode | null) {
    setSelectedFolder(folder)
    localStorage.setItem(SIDEBAR_SELECTED_FOLDER, JSON.stringify(folder))
  }

  {/** FsNode Manipulations */}
  function renameNodeHandler(renameNode: FsNode, newName: string) {
    renameFsNode(renameNode, newName)
    
    // Update names in tabs
    if (renameNode.type === "file") {
      for (const tabId of tabIdsByFileIds[renameNode.id] ?? []) {
        renameFileInTab(tabId, renameNode.id, newName)
      }
    }
  }

  function cancelRenameHandler() {
    setRenameNodeId(null)
    if (renameInputRef.current) renameInputRef.current.value = ''
  }

  function removeNodeHandler(removeNode: FsNode) {
    const ok = window.confirm(`Confirm to delete\n\n${removeNode.name}\n`)
    if (!ok) return

    if (removeNode.type === "folder") {
      const folderNode = nodes.get(removeNode.id)
      // ! Currently we prevent deleting folder when child exists
      if (folderNode?.type === 'folder' && folderNode.children.length !== 0) {
         window.alert("This folder isn’t empty. Delete/move the contents first.")
         return
      }
      selectFolderHandler(null)
      // if folder is removed, delete it from toggled list
      setToggledFolderIds((prev) => {
        if (!prev.has(removeNode.id)) return prev
        const next = new Set(prev)
        next.delete(removeNode.id)
        localStorage.setItem(SIDEBAR_TOGGLED_FOLDERS, JSON.stringify(Array.from(next)))
        return next
      })

    } else {
      selectFileHandler(null)
      // close the file in tabs on remove
      for (const tabId of tabIdsByFileIds[removeNode.id] ?? []) {
        closeFileInTab(tabId, removeNode as FileNode)
      }
    }

    removeFsNode(removeNode)
  }

  /** 
   * ! Functions that manipulates FsTree with FsTreeStore supports
   * Overall Rules
   * 1. dropPostion must be "inside" for moving into folders
   * 2. Otherwise, "before" & "after" must be set
   * 3. Folders can't be dropped into its descendant folders
   * Follow the listed cases for more
   * */
  useEffect(() => {

    /** Global mouse movement listener */
    function onMouseMove(e: PointerEvent) {
      // If no node is selected, bail out
      if (!dragNodeRef.current && !dragState) return

      // Initialize dragState once selected node is draggged off
      if (dragNodeRef.current && !dragState) {
        const dx = e.clientX - dragNodeRef.current.startX
        const dy = e.clientY - dragNodeRef.current.startY
        if (Math.hypot(dx, dy) < 6) return
        setDragState({
          draggingNode: dragNodeRef.current.draggingNode,
          x: e.clientX,
          y: e.clientY,
          targetNodeId: null,
          targetParentId: null,
          dropPosition: "after",
        })
        return
      }

      // During activated drag, provide real-time update of drag position
      setDragState((prev) => {
        if (!prev) return prev

        const mouseTarget = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        const targetNodeEl = mouseTarget?.closest?.("[data-node-id]") as HTMLElement | null
        const targetNodeId = targetNodeEl ? Number(targetNodeEl.getAttribute("data-node-id")) : null
        
        let targetParentId: number | null = null
        let dropPosition: "before" | "inside" | "after" = "after"
      
        // draggingNode itself can't be targetNode
        if (targetNodeId != null && targetNodeId !== prev.draggingNode.id) {
          const targetNode = nodes.get(targetNodeId) ?? null
          // Compute relative position on TargetNode
          if (targetNode) {
            // r gives top and height of the target element
            const r = targetNodeEl!.getBoundingClientRect()
            const relativePos = (e.clientY - r.top) / r.height
            if (targetNode.type === 'folder') {
              if (relativePos < 0.25) dropPosition = "before"
              else if (relativePos > 0.75) dropPosition = "after"
              else dropPosition = "inside"
            } else {
              dropPosition = relativePos < 0.5 ? "before" : "after"
            }
            // if targetNode is a folder, set the folder to the targetParent
            if (dropPosition === "inside" && targetNode.type === "folder") {
              targetParentId = targetNode.id
            } else {
              targetParentId = targetNode.parentId ?? null
            }
          }
        }

        return {
            ...prev,
            x: e.clientX,
            y: e.clientY,
            targetNodeId,
            targetParentId,
            dropPosition,
        }
      })
    }

    // Based on computed dragState, handle reposition of nodes 
    async function onMouseUp() {
      if (dragState) {
        const draggingNode = dragState.draggingNode
        const targetNodeId = dragState.targetNodeId
        const targetParentId = dragState.targetParentId
        const dropPosition = dragState.dropPosition

        if (draggingNode && targetNodeId) {
          const targetNode = nodes.get(targetNodeId)
          if (targetNode) {
            moveFsNode(draggingNode, targetNode, targetParentId, dropPosition)
          }
        }
      }
      dragNodeRef.current = null
      setDragState(null)
    }
      window.addEventListener("pointermove", onMouseMove, true)
      window.addEventListener("pointerup", onMouseUp, true)

    return () => {
      window.removeEventListener("pointermove", onMouseMove, true)
      window.removeEventListener("pointerup", onMouseUp, true)
    }
  }, [nodes, dragState])

  // Update dragNodeRef on Every Node Selection
  function onPointerDownNode(e: React.PointerEvent, node: FsNode) {
    // only left click
    if (e.button !== 0) return
    // not applicable during rename
    if (renameNodeId !== null) return

    dragNodeRef.current = {
      draggingNode: node,
      startX: e.clientX,
      startY: e.clientY,
    }
  }

  /** 
   * ! New Prompt Behavior for creating new FsNode  
   * Updates newNodeType to the selected type
   * Once it changes, useEffect focues newNodePromptInputRef
   * and renderNewNodePrompt will re-evaludate
   * which <li> element to display newNodePromptRef and newNodePromptInputRef
   * under the current selectedFolder */
  function createNewNode(type: 'folder' | 'file') {
    // if new node type is already set, highlight prompt again
    if (newNodeType === type) {
      if (newNodePromptInputRef.current) newNodePromptInputRef.current.focus()
      return
    }
    // set new node type and delete prompt input if any
    setNewNodeType(type)
    if (newNodePromptInputRef.current) newNodePromptInputRef.current.value = ''
  }

  /** 
   * Render <li> element that contains prompt refs which is to 
   * be inserted under the current selectedFolder inside <ul> element */
  function renderNewNodePrompt(depth: number) {
    return renderNewNodePromptHandler( 
      newNodeType, // prompt type
      selectedFolder, // parent where to render prompt under
      depth, // indent
      newNodePromptRef,
      newNodePromptInputRef,
      submitNewNodePrompt, // prompt submission
      cancelNewNodePrompt // prompt cancel
    )
  }

  /**
   * Create a new FsNode
   * Once submitted, it updates FsTree
   * and the new node to be highlighted */
  async function submitNewNodePrompt() {
    await submitNewNodePromptHandler(
      // both file/folder
      newNodePromptInputRef,
      newNodeType, 
      selectedFolder, // identify folder under whose new node to be created
      cancelNewNodePrompt, 
      selectNodeHandler, // selected newly created node
      // only folder
      toggleFolderHandler
    )
  }

  /**
   * Cancel newNodePrompt
   * This should be used whenever new node prompt to be cancelled */
  function cancelNewNodePrompt() {
    setNewNodeType(null)
    if (newNodePromptInputRef.current) newNodePromptInputRef.current.value = ''
  }

  /** 
   * ! Render FsTree */
  function renderNode(node: FsNode, depth = 0) {
    return renderNodeHandler(
      // both file/folder
      node, // each node being renderer
      depth, // each node depth
      selectedFile,
      selectedFolder,
      selectNodeHandler, // used to set selectedNode
      // only file
      nodes,
      selectFolderHandler,
      // only folder
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
      toggleFolderHandler,
      renderNewNodePrompt, // rendering newNodePrompt under folders
      // remove
      removeNodeHandler,
      // renaming
      renameNodeId,
      renameInputRef,
      setRenameNodeId,
      renameNodeHandler,
      cancelRenameHandler,
      // dragging
      dragState,
      onPointerDownNode
    )
  }

  function renderFsTree() {
    return (<>
      {/* FsNodes Container */}
      {roots.length === 0 ? (
          <>
            {/* No Items and Root Prompt When No Items */}
            {!newNodeType 
              ? <div style={{ opacity: 0.7 }}>No items</div> 
              : <ul style={{ padding: 4 }}>
                  {renderNewNodePrompt(0)}
                </ul>
            }
          </>
          ) : (
            <ul style={{ 
              margin: 4,
              overflowX: 'hidden',
            }}>
              {/* FsNodes Rendering */}
              {roots.map((root) => renderNode(root, 0))}
              {/* Root Prompt When Items */}
              {newNodeType && !selectedFolder ? renderNewNodePrompt(0) : null}
            </ul>
          )
        }
    </>)
  }

  return (
    <>
      {/* Sidebar Container */}
      <aside style={{ 
        height: "100%",
        paddingLeft: "10px",
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
      }}>
        {/* Sidebar Toolbar Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            minHeight: "35px",
            paddingRight: "10px",
            justifyContent: 'flex-end',
            gap: 6,
          }}
        >

          {/* right icons */}
          <div 
            style={{ 
              display: 'flex', 
              gap: 6,
          }}>
            <button
              tabIndex={-1}
              onClick={() => createNewNode('folder')}
              data-new-node-btn="true"
            >
              <ToolbarIcon 
                whiteIcon={newFolderIcon}
                onlyWhiteIcon={true}
              />
            </button>
            <button
              tabIndex={-1} 
              onClick={() => createNewNode('file')}
              data-new-node-btn="true"
            >
              <ToolbarIcon 
                whiteIcon={newFileIcon}
                onlyWhiteIcon={true}
              />
            </button>
          </div>
      </div>

      {/* FsNodes Container Rendering */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {renderFsTree()}
      </div>

      {/* Dragging Node Name */}
      {dragState ? (
        <div
          style={{
            position: "fixed",
            left: dragState.x + 12,
            top: dragState.y + 12,
            pointerEvents: "none",
            zIndex: 99999,
            padding: "4px 8px",
            background: "transparent",
            fontSize: fileFontSize,
            whiteSpace: "nowrap",
          }}
        >
          {dragState.draggingNode.name}
        </div>
      ) : null}
      </aside>
    </>
  )
}

export default Sidebar