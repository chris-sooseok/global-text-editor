import { useState, useEffect, useRef, useMemo } from 'react'
import { type RefObject, type Dispatch, type SetStateAction } from 'react'
import { FsTreeStore } from '../../store/FsTreeStore/FsTreeStore'
import { buildFsTree } from '../../store/FsTreeStore/FsTreeStoreHelper'
import { TabManagerStore } from '../../store/TabManagerStore/TabManagerStore'
import type { FileNode, FolderNode, FsNode } from '../../store/FsTreeStore/FsTreeTypes'
import { 
  submitNewNodePromptHandler,  
  renderNewNodePromptHandler,
  renderNodeHandler,
} from './SidebarHandler'
import { parseLocalStorage } from 'shared/parseLocalStorage'
import { ThemeManagerStore } from 'store/ThemeStore/ThemeManagerStore'

const SELECTED_FILE = String(import.meta.env.VITE_SELECTED_FILE)
const SELECTED_FOLDER = String(import.meta.env.VITE_SELECTED_FOLDER)
const TOGGLED_FOLDER_IDS = String(import.meta.env.VITE_TOGGLED_FOLDERS_IDS)

export type SelectedNodeType = FsNode | null

export type DragState = {
    draggingNode: FsNode
    x: number
    y: number
    targetNodeId: number | null
    targetParentId: number | null
    dropPosition: "before" | "inside" | "after"
  }

export default function Sidebar({
  newNodeType,
  newNodePromptRef,
  newNodePromptInputRef,
  setNewNodeType
}: {
  newNodeType: 'folder' | 'file' | null,
  newNodePromptRef: RefObject<HTMLDivElement | null>,
  newNodePromptInputRef: RefObject<HTMLInputElement | null>,
  setNewNodeType: Dispatch<SetStateAction<'folder' | 'file' | null>>
}) {
  
  const { nodeFontSize } = ThemeManagerStore.getState()

  const nodeRows = FsTreeStore((s) => s.nodeRows)
  const loadFsNodes = FsTreeStore((s) => s.loadFsNodes)
  const { roots, nodes } = useMemo(() => buildFsTree(nodeRows), [nodeRows])
  
  /** ensure loading fsTree when mounting sidebar */
  useEffect(() => {
    void loadFsNodes(window.api)
  }, [loadFsNodes])

  /** Interaction with Tabs */
  const { openFileInActiveTab, renameFileInTab, closeFileInTab } = TabManagerStore.getState()
  const tabIdsByFileIds = TabManagerStore((s) => s.tabIdsByFileIds)

  /** Folder Toggle and Highlight Logics */
  const [toggledFolderIds, setToggledFolderIds] = useState<Set<number>>(() => {
    // localStorage only supports arr, so we make sure to conver to Set
    const arr = parseLocalStorage<number[]>(localStorage.getItem(TOGGLED_FOLDER_IDS), [])
    return new Set(arr)
  })

  /**  Separate states for selected file and folder to control highlight behaviors */
  const [selectedFile, setSelectedFile ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>(localStorage.getItem(SELECTED_FILE), null)
  })
  
  const [selectedFolder, setSelectedFolder ] = useState(() => {
    return parseLocalStorage<SelectedNodeType>(localStorage.getItem(SELECTED_FOLDER), null)
  })

  /** Mouse Down for Setting selectedFolder to null */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      const clickedIconButton = !!target.closest('[data-new-node-btn="true"]')
      const clickedNode = !!target.closest('[data-node-id]')

      if (!clickedIconButton && !clickedNode && selectedFolder) {
        selectFolderNullHandler()
      }
    }

    // capture=true runs before React handlers / focus changes
    document.addEventListener("mousedown", onMouseDown, true)
    return () => document.removeEventListener("mousedown", onMouseDown, true)
  }, [])

  /** FsTree Manipulation */
  const [renameNodeId, setRenameNodeId] = useState<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const { renameFsNode, removeFsNode, moveFsNode } = FsTreeStore.getState()

  const [dragState, setDragState] = useState<DragState | null>(null)
  const dragNodeRef = useRef<{draggingNode: FsNode, startX: number, startY: number} | null>(null)

  /** Folder Toggle and Highlight Logics */
  function toggleFolderHandler(nodeId: number) {
    setToggledFolderIds((prev) => {
      const next = new Set(prev) // create a new Set so React sees a new reference
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      localStorage.setItem(TOGGLED_FOLDER_IDS, JSON.stringify(Array.from(next)))
      return next
    })
  }

  /**
   * Whenever a file is to be selected, use this function
   * When a file is selcted
   * 1. always update selectedFolder to the selectedFile's parent
   * 2. always open the selectedFile in the active tab
   */
  function selectFileHandler(fileNode: FileNode) {
    setSelectedFile(fileNode)
    localStorage.setItem(SELECTED_FILE, JSON.stringify(fileNode))
    // update selectedFolder
    const parentNode = nodes.get(fileNode.parentId) ?? null
    if (parentNode) {
      setSelectedFolder(parentNode)
      localStorage.setItem(SELECTED_FOLDER, JSON.stringify(parentNode))
    } else {
      selectFolderNullHandler()
    }
    // open the file in the active tab
    openFileInActiveTab(fileNode)
  }

  // Whenever the selectedFile is nullified, use this function
  function selectFileNullHandler() {
    setSelectedFile(null)
    localStorage.setItem(SELECTED_FILE, JSON.stringify(null))
  }

  /**
   * Whenever a folder is to be selected, use this function
   * When a folder is selected
   * 1. always nullify selectedFile
   * 2. check one of the cases below
   */
  function selectFolderHandler(folderNode: FolderNode) {
    if (folderNode) {
      const isSelectedFilesFolder = folderNode.id === selectedFile?.parentId
      const isSelectedFolder = folderNode.id === selectedFolder?.id
      const isExpanded = toggledFolderIds.has(folderNode.id)
      selectFileNullHandler()

      // folder is not selected & not open -> select folder & open
      if (!isSelectedFolder && !isExpanded) {
        setSelectedFolder(folderNode as FolderNode)
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(folderNode))
        toggleFolderHandler(folderNode.id)
        return
      }

      // folder is not the selected folder & open -> select folder
      if (!isSelectedFolder && isExpanded) {
        setSelectedFolder(folderNode as FolderNode)
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(folderNode))
        return
      }

      // folder is the selectedFolder as well as the selectedFile's folder, and open -> select folder
      if (isSelectedFilesFolder && !isSelectedFolder && isExpanded) {
        setSelectedFolder(folderNode as FolderNode)
        localStorage.setItem(SELECTED_FOLDER, JSON.stringify(folderNode))
        return
      }
        
      // if this folder is selected and not the selectedFile's folder, and open -> unselect and close
      if (isSelectedFolder && isExpanded) {
        selectFolderNullHandler()
        toggleFolderHandler(folderNode.id)
        return
      }
    }
  }
  
  // whenever the selectedFolder is to be nullified, use this function
  function selectFolderNullHandler() {
    setSelectedFolder(null)
    localStorage.setItem(SELECTED_FOLDER, JSON.stringify(null))
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
      selectFolderNullHandler()
      // if folder is removed, delete it from toggled list
      setToggledFolderIds((prev) => {
        if (!prev.has(removeNode.id)) return prev
        const next = new Set(prev)
        next.delete(removeNode.id)
        localStorage.setItem(TOGGLED_FOLDER_IDS, JSON.stringify(Array.from(next)))
        return next
      })

    } else {
      selectFileNullHandler()
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
        
        let targetParentId: number
        let dropPosition: "before" | "inside" | "after" = "after"
      
        // draggingNode itself can't be targetNode
        if (targetNodeId != null && targetNodeId !== prev.draggingNode.id) {
          const targetNode = nodes.get(targetNodeId) ?? null
          // Compute relative position on TargetNode
          if (targetNode) {
            // r gives top and height of the target element
            const r = targetNodeEl!.getBoundingClientRect()
            const relativePos = (e.clientY - r.top) / r.height
            // compute drop position
            if (targetNode.type === 'folder') {
              if (relativePos < 0.25) dropPosition = "before"
              else if (relativePos > 0.75) dropPosition = "after"
              else dropPosition = "inside"
            } else {
              dropPosition = relativePos < 0.5 ? "before" : "after"
            }
            // if targetNode is a folder, set the folder to the targetParent
            // otherwise, set targetNode's parent to targetParentId
            if (dropPosition === "inside" && targetNode.type === "folder") {
              targetParentId = targetNode.id
            } else {
              targetParentId = targetNode.parentId
            }

            return {
              ...prev,
              x: e.clientX,
              y: e.clientY,
              targetNodeId,
              targetParentId,
              dropPosition,
            }
          }
        }

        return {
          ...prev,
          x: e.clientX,
          y: e.clientY,
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
      selectFileHandler,
      selectFolderHandler
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
      selectFileHandler, // used to set selectedNode
      // only file
      selectFolderHandler,
      // only folder
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
      toggledFolderIds, // keep track of folder node ids to expand
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
            fontSize: nodeFontSize,
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