import { useEffect, useRef, useState } from 'react'
import IconButton from './IconButton'
import hideIcon from '../../assets/icons8-hide-sidepanel-96.png'
import FsTreeProvider from '../../context/FsTreeContext/FsTreeContext'
import Sidebar from './Sidebar'

const SIDEBAR_DEFAULT_WIDTH = Number(import.meta.env.VITE_SIDEBAR_DEFAULT_WIDTH)
const SIDEBAR_MIN_WIDTH =  Number(import.meta.env.VITE_SIDEBAR_MIN_WIDTH)
const SIDEBAR_MAX_WIDTH =  Number(import.meta.env.VITE_SIDEBAR_MAX_WIDTH)
const COLLAPSED_WIDTH = Number(import.meta.env.VITE_COLLAPSED_WIDTH)

function SidebarRenderer() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_DEFAULT_WIDTH)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0) // mouse X position when dragging
  const startWidthRef = useRef(0) // current sidebar width when dragging

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev)
  }

  const appliedWidth = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // if true, don't allow dragging
      if (!isDraggingRef.current || sidebarCollapsed) return

      const draggingX = e.clientX - startXRef.current
      const nextWidth = startWidthRef.current + draggingX

      // width limit
      setSidebarWidth(Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, nextWidth)))
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
  }, [])

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
        borderRight: '2px solid rgba(0,0,0,0.15)',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 180ms ease',
      }}
    >
      {/* Topbar above sidebar content */}
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '8px 12px',
          flexShrink: 0,
          borderBottom: '2px solid rgba(0,0,0,0.15)',
        }}
      >
        <IconButton
          src={hideIcon}
          label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          buttonSize={30}
          iconSize={20}
          background="transparent"
          onClick={toggleSidebar}
        />
      </div>

      {/* Sidebar content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          opacity: sidebarCollapsed ? 0 : 1,
          transition: 'opacity 120ms ease',
          pointerEvents: sidebarCollapsed ? 'none' : 'auto',
        }}
      >
        {sidebarCollapsed ? null : <Sidebar />}
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
