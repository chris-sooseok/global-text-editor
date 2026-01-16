import { useEffect, useRef, useState } from 'react'
import IconButton from './IconButton'
import hideIcon from '../../assets/icons8-hide-sidepanel-96.png'
import Sidebar from './Sidebar'

const DEFAULT_SIDEBAR_WIDTH = Number(import.meta.env.VITE_DEFAULT_SIDEBAR_WIDTH)
const SIDEBAR_MIN_WIDTH =  Number(import.meta.env.VITE_SIDEBAR_MIN_WIDTH)
const SIDEBAR_MAX_WIDTH =  Number(import.meta.env.VITE_SIDEBAR_MAX_WIDTH)
const COLLAPSED_WIDTH = Number(import.meta.env.VITE_COLLAPSED_WIDTH)

const SIDEBAR_WIDTH_KEY = String(import.meta.env.VITE_SIDEBAR_WIDTH_KEY)
const SIDEBAR_COLLAPSED_KEY = String(import.meta.env.VITE_SIDEBAR_COLLAPSED_KEY)

function SidebarRenderer() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY)
    if (!raw) return DEFAULT_SIDEBAR_WIDTH
    try {
      const parsed: number = JSON.parse(raw)
      return parsed
    } catch (err) {
      console.error(err)
      return DEFAULT_SIDEBAR_WIDTH
    }
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (!raw) return false
    try {
      const parsed: boolean = JSON.parse(raw)
      return parsed
    } catch (err) {
      console.error(err)
      return false
    }
  })
  // on setSidebarCollapsedHandler, get appliedWidth
  const appliedWidth = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth
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
      const clamped = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, nextWidth))
  
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
    localStorage.setItem(SIDEBAR_WIDTH_KEY, JSON.stringify(width))
  }

  function setSidebarCollapsedHandler() {
    setSidebarCollapsed((prev: boolean) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next)) // store boolean as JSON string
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
          onClick={setSidebarCollapsedHandler}
        />
      </div>

      {/* Sidebar content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
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
