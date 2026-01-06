import { useEffect, useRef, useState } from 'react'
import Sidebar from './pages/Sidebar'
import FsTreeProvider from './context/FsTreeContext'
import IconButton from './pages/IconButton'
import hideIcon from './assets/icons8-hide-sidepanel-96.png'

function App() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

  const COLLAPSED_WIDTH = 42 // thin strip that shows border + button

  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) return
      if (sidebarCollapsed) return

      const dx = e.clientX - startXRef.current
      const nextWidth = startWidthRef.current + dx

      const min = 220
      const max = 700
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

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev)
  }

  const effectiveWidth = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth

  return (
    <FsTreeProvider api={window.api}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div
          style={{
            width: effectiveWidth,
            position: 'relative',
            borderRight: '1px solid rgba(0,0,0,0.15)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {sidebarCollapsed ? (
            // collapsed strip: ONLY toggle button is visible
            <div
              style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 8,
              }}
            >
              <IconButton
                src={hideIcon}
                label="Show sidebar"
                onClick={toggleSidebar}
              />
            </div>
          ) : (
            <Sidebar onToggleSidebar={toggleSidebar} />
          )}

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

        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* main content */}
        </div>
      </div>
    </FsTreeProvider>
  )
}

export default App
