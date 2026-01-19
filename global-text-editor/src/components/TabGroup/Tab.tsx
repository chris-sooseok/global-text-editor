// TabGroup.tsx
import { useState } from "react"
import FileContent from "./FileContent/FileContent"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"
import { TabManagerStore } from "../../store/TabManagerStore/tabManagerStore"

function Tab({
  tabId
}: {tabId: string}) {

  const [menu, setMenu] = useState<{
    open: boolean
    x: number
    y: number
    file: FileNode | null
    }>({ open: false, x: 0, y: 0, file: null })

  const activeTabId = TabManagerStore((s) => s.activeTabId)
  const activeFileIdByTabIds = TabManagerStore((s) => s.activeFileIdByTabIds)
  const filesByTabIds = TabManagerStore((s) => s.filesByTabIds)

  const activeFileId = activeFileIdByTabIds[tabId]
  const files = filesByTabIds[tabId] ?? []

  const switchActiveTab = TabManagerStore((s) => s.switchActiveTab)
  const switchActiveFile = TabManagerStore((s) => s.switchActiveFile)
  const openNewTab = TabManagerStore((s) => s.openNewTab)
  const closeFile = TabManagerStore((s) => s.closeFile)
  const closeTab = TabManagerStore((s) => s.closeTab)

  
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
    {/* Tab bar */}
    <div
      style={{
        height: 45, // tab height
        display: "flex",
        alignItems: "stretch", // let files fill all space
        padding: "0 15px 0 0", // only right padding for close button
        borderRight: "1px solid rgba(0,0,0,0.15)",
        justifyContent: "space-between" // placing close button to right end
      }}
    >
      <style>{`
        /* Chrome / Edge / Electron */
        .files-scrollbar::-webkit-scrollbar {
          height: 0px;
        }

        /* Firefox */
        .files-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
      {/* Left: files list */}
      <div 
        className="files-scrollbar"
        style={{ 
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          gap: 1, // little space between files
          overflow: "auto", // scrollable
        }}
      >
        {files.map((file) => (
          <div 
            key={file.id} 
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              padding: "0 8px", // padding between files
              gap: 6, // gap between filename and close button
              background:
                activeFileId === file.id
                  ? (activeTabId === tabId 
                    ? "rgba(131, 125, 220, 0.15)" 
                    : "rgba(211, 171, 171, 0.06)")
                  : undefined,
              borderBottom: 
                activeFileId === file.id 
                  ? (activeTabId === tabId
                    ? "2px solid rgba(189, 184, 184, 0.15)" 
                    : "2px solid rgba(132, 124, 124, 0.15)")
                  : undefined,
          }}>
            {/* filename */}
            <button
              onClick={() => {
                if (activeTabId !== tabId) switchActiveTab(tabId)
                switchActiveFile(tabId, file)
              }}
              onContextMenu={(e) =>{
                e.preventDefault()
                setMenu({ open: true, x: e.clientX, y: e.clientY, file: file })
              }}
              style={{
                border: 0,
                padding: "0 5px", // padding around name
                cursor: "pointer",
                fontWeight: activeFileId === file.id ? 600 : 400,
                opacity: activeFileId === file.id ? 1 : 0.8,
              }}
            >
              {file.name}
            </button>

              {/* file close button */}
            <button
              onClick={() => closeFile(tabId, file)}
              style={{
                border: 0,
                paddingRight: "5px",
                background: "transparent",
                cursor: "pointer",
                opacity: 0.7,
              }}
              aria-label={`Close ${file.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
        

      {/* Right controls */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer"
        }}
      >
        <button onClick={() => closeTab(tabId)}>
          ✕
        </button>
      </div>  
    </div>

    {/* Content area */}
    <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <FileContent />
    </div>

    {/** right click dropdown on file */}
    {menu.open && menu.file ? (
      <>
        {/* click-away overlay */}
        <div
          onClick={() => setMenu({ open: false, x: 0, y: 0, file: null })}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
        />

        {/* menu */}
        <div
          style={{
            position: "fixed",
            left: menu.x,
            top: menu.y,
            zIndex: 1000,
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: 6,
            padding: 6,
            minWidth: 160,
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: 0,
              background: "transparent",
              padding: "8px 10px",
              cursor: "pointer",
            }}
            onClick={() => {
              // Right split action
              if (menu.file) openNewTab(menu.file)
              setMenu({ open: false, x: 0, y: 0, file: null })
            }}
          >
            Right split
          </button>
        </div>
      </>
    ) : null}
  </div>
  )
}

export default Tab
