// TabGroup.tsx
import { useState } from "react"
import NormalEditor from "../FileEditor/NormalEditor/NormalEditor"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"
import { TabManagerStore } from "../../store/TabManagerStore/TabManagerStore"

function Tab({tabId}: {tabId: string}) {

  // right-click on filename display dropdown DOM
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)

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

  // TODO: will have to consider loading tiptap editor here and update content on file change
  // const editor = useEditor({
  //   extensions: [StarterKit],
  //   content: "<p>Hello TipTap</p>",
  // })

  return (
  <>
  {/* Tab and FileEditor Container */}
  <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    {/* Tabbar Container */}
    <div
      style={{
        height: 45, // tab height
        display: "flex",
        alignItems: "stretch", // files occupy all tab space
        padding: "0 15px 0 0", // right padding for tab close btn
        borderRight: "1px solid rgba(0,0,0,0.15)", // tab distinguish
        justifyContent: "space-between" // space between files and tab close btn
      }}
    >
      {/* files scroll config */}
      <style>{`
        /* Chrome / Edge / Electron */
        .files-scroll::-webkit-scrollbar {
          height: 0px;
        }
        /* Firefox */
        .files-scroll {
          scrollbar-width: none;
        }
      `}</style>
      {/* Files Container */}
      <div 
        className="files-scroll"
        style={{ 
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          textWrap: "nowrap",
          gap: 1, // little space between files
          overflowX: "auto", // horizontal scroll
          overflowY: "hidden",
        }}
      >
        {/* filename and file close button */}
        {files.map((file) => (
          <div 
            key={file.id} 
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              padding: "0 8px", // padding between files
              gap: 6, // gap between filename and file close button
              // active file highlight under active or non-active tab
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
              // dropdown on right-click on filename
              onContextMenu={(e) => {
                e.preventDefault()
                setDropdownMenu({ open: true, x: e.clientX, y: e.clientY, file })
              }}
              style={{
                padding: "0 5px", // padding around fileanme
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
                paddingRight: "5px", // align padding with filename padding
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
          paddingLeft: "15px", // preventing file close button from overlapping
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        <button onClick={() => closeTab(tabId)}>
          ✕
        </button>
      </div>
    </div>

    {/* File Editor */}
    <div style={{ 
      flex: 1, // file editor takes up the renaming space
      minWidth: 0, // force width shrink
      minHeight: 0, // force height shrink 
    }}
    >
        <NormalEditor />
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
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: dropdownMenu.x,
          top: dropdownMenu.y,
          zIndex: 1000,
          border: "1px solid white",
          borderRadius: "4px",
          background: "black",
        }}
      >
        <button
          style={{
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

        {/* TODO */}
        <button
          style={{
            background: "transparent",
            cursor: "pointer",
            padding: "6px 10px",
          }}
        >
          Copy Path
        </button>
      </div>
    </>
  ) : null}
  </>
  )
}

export default Tab
