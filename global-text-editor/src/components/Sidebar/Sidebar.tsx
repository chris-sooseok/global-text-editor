import { useState, useEffect, useRef, useMemo } from 'react'
import { type RefObject, type Dispatch, type SetStateAction } from 'react'
import { SidebarStore } from '../../store/FsTreeStore/SidebarStore'
import type { FsNode } from 'store/FsTreeStore/FsTreeTypes'
import { 
  submitNewNodePromptHandler,  
  renderNewNodePromptHandler,
  renderNodeHandler,
} from './SidebarHandler'
import { ThemeManagerStore } from 'store/ThemeStore/ThemeManagerStore'

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

  const { roots, nodes } = SidebarStore.getState()
  const { activeFolder, setActiveFolder } = SidebarStore.getState()

  /** Mouse Down for setting selectedFolder to null for allowing node creation at root level
   * This is neccessary since when a file is selected, the selectedFolder needs to be set to the file's parent
   * Originally, this was handled by onBlur on an individual node element. However, since editor needs focus
   * selectedFolder can't possibly be set to the file's parent, thus controlling it with the mouse down rule
   */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (!activeFolder) return

      const clickedIconButton = !!target.closest('[data-new-node-btn="true"]')
      const clickedNode = !!target.closest('[data-node-id]')

      if (!clickedIconButton && !clickedNode) {
        setActiveFolder(null)
      }
    }

    document.addEventListener("mousedown", onMouseDown, true)
    return () => document.removeEventListener("mousedown", onMouseDown, true)
  }, [])

  /** FsTree Manipulation */
  const [renameNodeId, setRenameNodeId] = useState<number | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const { renameFsNode, removeFsNode, moveFsNode } = SidebarStore.getState()

  const [dragState, setDragState] = useState<DragState | null>(null)
  const dragNodeRef = useRef<{draggingNode: FsNode, startX: number, startY: number} | null>(null)


  {/** FsNode Manipulations */}
  function renameNodeHandler(renameNode: FsNode, newName: string) {
    renameFsNode(renameNode, newName)
  }

  function cancelRenameHandler() {
    setRenameNodeId(null)
    if (renameInputRef.current) renameInputRef.current.value = ''
  }

  function removeNodeHandler(removeNode: FsNode) {
    const ok = window.confirm(`Confirm to delete\n\n${removeNode.name}\n`)
    if (!ok) return
    removeFsNode(removeNode)
  }

  /** 
   * Node Move and Drop Rules
   * 1. dropPostion must be "inside" for moving into folders
   * 2. Otherwise, "before" & "after" must be set
   * 3. Folders can't be dropped into its descendant folders
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
      cancelNewNodePrompt, 
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
      node,
      depth,
      // only folder
      renderNode, // recursively rendering fsNode
      newNodeType, // used to render renderNewNodePrompt
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
              {newNodeType && !activeFolder ? renderNewNodePrompt(0) : null}
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