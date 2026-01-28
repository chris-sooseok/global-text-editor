import { useEffect, useRef, useState } from 'react'
import hideIcon from 'assets/Sidebar/icons8-hide-sidepanel-96.png'
import Sidebar from './Sidebar'
import settingIcon from 'assets/Sidebar/icons8-settings-white-96.png'
import { parseLocalStorage } from 'shared/parseLocalStorage'
import ToolbarIcon from 'shared/ToolbarIcon'

const SIDEBAR_DEFAULT_WIDTH = Number(import.meta.env.VITE_SIDEBAR_DEFAULT_WIDTH)
const SIDEBAR_MIN_WIDTH =  Number(import.meta.env.VITE_SIDEBAR_MIN_WIDTH)
const SIDEBAR_COLLAPSED_WIDTH = Number(import.meta.env.VITE_SIDEBAR_COLLAPSED_WIDTH)

const SIDEBAR_WIDTH = String(import.meta.env.VITE_SIDEBAR_WIDTH)
const SIDEBAR_COLLAPSED = String(import.meta.env.VITE_SIDEBAR_COLLAPSED)

function SidebarRenderer() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    return parseLocalStorage<number>
    (localStorage.getItem(SIDEBAR_WIDTH), SIDEBAR_DEFAULT_WIDTH)
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return parseLocalStorage<boolean>
    (localStorage.getItem(SIDEBAR_COLLAPSED), false)
  })

  // on setSidebarCollapsedHandler, get appliedWidth
  const appliedWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0) // mouse X position when dragging
  const startWidthRef = useRef(0) // current sidebar width when dragging
  
  // Sidebar Drag Control
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // if true, don't allow dragging
      if (!isDraggingRef.current || sidebarCollapsed) return

      const draggingX = e.clientX - startXRef.current
      const nextWidth = startWidthRef.current + draggingX
      // width limit
      const clamped = Math.max(SIDEBAR_MIN_WIDTH, nextWidth)
  
      setSidebarWidthHandler(clamped)
    }

    function onMouseUp() {
      isDraggingRef.current = false
      // reset cursor back to normal after dragging
      document.body.style.cursor = ''
      // restore default selection behavior
      document.body.style.userSelect = ''
    }

    // add event functions
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [sidebarCollapsed])

  function setSidebarWidthHandler(width: number) {
    setSidebarWidth(width)
    localStorage.setItem(SIDEBAR_WIDTH, JSON.stringify(width))
  }

  function setSidebarCollapsedHandler() {
    setSidebarCollapsed((prev: boolean) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED, JSON.stringify(next))
      return next
    })
  }

  // initiate Sidebar width dragging
  function onDragStart(e: React.MouseEvent<HTMLDivElement>) {
    // if true, don't allow dragging
    if (sidebarCollapsed) return

    isDraggingRef.current = true
    startXRef.current = e.clientX // save the dragging start point
    startWidthRef.current = sidebarWidth // save the current width

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      style={{
        width: appliedWidth,
        height: '100%',
        position: 'relative',
        borderRight: '2px solid rgba(255, 255, 255, 0.15)',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 180ms ease',
        userSelect: "none", // prevent cursor highlight for all children
      }}
    >
      {/* Topbar above sidebar content */}
      <div
        style={{
          height: 45,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? "flex-end" : "space-between",
          padding: '0px 10px',
          flexShrink: 0,
        }}
      >

        {!sidebarCollapsed && (
          <div style={{ fontWeight: 600, fontSize: 20 }}>
            Files
          </div>
        )}

        <button
          type="button"
          onClick={setSidebarCollapsedHandler} 
          tabIndex={-1}
        >
          <ToolbarIcon
            whiteIcon={hideIcon}
            onlyWhiteIcon={true}
            size={20}
          />
        </button>
      </div>

      {/* Sidebar content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            opacity: sidebarCollapsed ? 0 : 1,
            pointerEvents: sidebarCollapsed ? "none" : "auto",
            transition: "opacity 120ms ease",
          }}
        >
          <Sidebar />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: 45,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0px 10px",
          flexShrink: 0,
          borderTop: "2px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <button type="button" tabIndex={-1}>
          <ToolbarIcon 
            whiteIcon={settingIcon}
            onlyWhiteIcon={true}
            size={20}
          />
        </button>
      </div>

      {/* only when not collapsed, allow dragging */}
      {!sidebarCollapsed && (
        <div
          onMouseDown={onDragStart}
          style={{
            position: 'absolute',
            top: 0,
            right: -4,
            width: 8,
            height: '100%',
            cursor: 'col-resize',
          }}
        />
      )}
    </div>
  )
}

export default SidebarRenderer
