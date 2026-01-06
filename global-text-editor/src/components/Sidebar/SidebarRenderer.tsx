import { useEffect, useRef, useState } from 'react'
import IconButton from './IconButton'
import hideIcon from '../../assets/icons8-hide-sidepanel-96.png'
import FsTreeProvider from '../../context/FsTreeContext'
import Sidebar from './Sidebar'

function SidebarRenderer() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(250)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

  const COLLAPSED_WIDTH = 55

  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev)
  }

  const effectiveWidth = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current || sidebarCollapsed) return

      const draggingX = e.clientX - startXRef.current
      const nextWidth = startWidthRef.current + draggingX

      const min = 220
      const max = 500
      setSidebarWidth(Math.max(min, Math.min(max, nextWidth)))
    }

    function onMouseUp() {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [sidebarCollapsed])

  function onDragStart(e: React.MouseEvent<HTMLDivElement>) {
    if (sidebarCollapsed) return

    isDraggingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = sidebarWidth

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <FsTreeProvider api={window.api}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div
          style={{
            width: effectiveWidth,
            position: 'relative',
            borderRight: '3px solid rgba(0,0,0,0.15)',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 180ms ease'
          }}
        >
          {/* top bar above sidebar content */}
          <div
            style={{
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '8px 12px',
              flexShrink: 0,
              borderBottom: '3px solid rgba(0,0,0,0.15)',
            }}
          >
            <IconButton
              src={hideIcon}
              label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              buttonSize={30}
              iconSize={20}
              background='transparent'
              onClick={toggleSidebar}
            />
          </div>

          {/* sidebar content */}
          <div style={{ 
                flex: 1, 
                overflow: 'auto',
                opacity: sidebarCollapsed ? 0 : 1,
                transition: 'opacity 120ms ease',
                pointerEvents: sidebarCollapsed ? 'none' : 'auto',
               }}>
            {sidebarCollapsed ? null : <Sidebar />}
          </div>

          {/* only if sidebar isn't collapsed, allow dragging */}
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

        <div style={{ flex: 1, overflow: 'auto' }}>{/* main content */}</div>
      </div>
    </FsTreeProvider>
  )
}

export default SidebarRenderer
