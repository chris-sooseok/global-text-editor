// TabGroup.tsx
import { useState } from "react"
import NormalType from "../FileTypes/NormalType/NormalType"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"
import { TabManagerStore } from "../../store/TabManagerStore/TabManagerStore"


function Tab({tabId}: {tabId: string}) {

  // right-click on file display dropdown DOM
  const [dropdownMenu, setDropdownMenu] = useState<{
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

  const isActiveTab = tabId === activeTabId

  const switchActiveTab = TabManagerStore((s) => s.switchActiveTab)
  const switchActiveFile = TabManagerStore((s) => s.switchActiveFile)
  const openNewTab = TabManagerStore((s) => s.openNewTab)
  const closeFile = TabManagerStore((s) => s.closeFile)
  const closeTab = TabManagerStore((s) => s.closeTab)

  // const editor = useEditor({
  //   extensions: [StarterKit],
  //   content: "<p>Hello TipTap</p>",
  // })

  return (
  <>
  {/* Tab and FileContent Container */}
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
        alignItems: "stretch", // files fill tab space
        padding: "0 15px 0 0", // right padding for close btn
        borderRight: "1px solid rgba(0,0,0,0.15)",
        justifyContent: "space-between" // space between files and close btn
      }}
    >
      {/* files scrollbar */}
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
      {/* File List */}
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
        {/* filename and close button */}
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
                  ? (isActiveTab
                    ? "rgba(131, 125, 220, 0.15)" 
                    : "rgba(211, 171, 171, 0.06)")
                  : undefined,
              borderBottom: 
                activeFileId === file.id 
                  ? (isActiveTab
                    ? "2px solid rgba(189, 184, 184, 0.15)" 
                    : "2px solid rgba(132, 124, 124, 0.15)")
                  : undefined,
              
          }}> 
            {/* filename */}
            <button
              onClick={() => {
                if (!isActiveTab) switchActiveTab(tabId)
                if (activeFileId !== file.id) switchActiveFile(tabId, file)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                setDropdownMenu({ open: true, x: e.clientX, y: e.clientY, file })
              }}
              style={{
                padding: "0 5px", // padding around name
                cursor: "pointer",
                fontSize: "16px",
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
                paddingRight: "5px",
                cursor: "pointer",
                opacity: activeFileId === file.id ? 1 : 0.8,
                fontSize: "14px",
              }}
              aria-label={`Close ${file.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      

      {/* Tab Close Button */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: "15px", // preventing file close button to overlap
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        <button onClick={() => closeTab(tabId)}>
          ✕
        </button>
      </div>
    </div>

    {/* Content area */}
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
        <NormalType />
    </div>

  </div>

  {/* Right-Click File Dropdown */}
  {dropdownMenu.open && dropdownMenu.file ? (
    <>
      {/* click-away overlay */}
      <div
        onClick={() => setDropdownMenu({ open: false, x: 0, y: 0, file: null })}
        style={{ position: "fixed", inset: 0, zIndex: 999 }}
      />

      {/* menu */}
      <div
        style={{
          position: "fixed",
          left: dropdownMenu.x,
          top: dropdownMenu.y,
          zIndex: 1000,
          border: "1px solid white",
          background: "grey",
        }}
      >
        <button
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            padding: "6px 10px",
          }}
          onClick={() => {
            if (!dropdownMenu.file) return
            openNewTab(dropdownMenu.file)
            setDropdownMenu({ open: false, x: 0, y: 0, file: null })
          }}
        >
          Split right
        </button>
      </div>
    </>
  ) : null}
  </>
  )
}

export default Tab
