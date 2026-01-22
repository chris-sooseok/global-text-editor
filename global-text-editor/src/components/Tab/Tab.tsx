// TabGroup.tsx
import { useState, useRef } from "react"
import NormalEditor from "../FileEditor/NormalEditor/NormalEditor"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import xIcon from "assets/Tab/icons8-x-96.png"
import ToolbarIcon from "shared/ToolbarIcon"
import DropdownOverlay from "shared/DropdownOverlay"

function Tab({tabId}: {tabId: string}) {

  const fileFontSize = ThemeManagerStore((s)=>s.fileFontSize)
  const activeFileUnderActiveTabBgr = ThemeManagerStore((s) => s.activeFileUnderActiveTabBgr)
  const activeFileBorder = ThemeManagerStore((s)=>s.activeFileBorder)
  const activeFileBackground = ThemeManagerStore((s)=>s.activeFileBackground)

  // right-click on filename display dropdown DOM
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // const [dropdownMenu, setDropdownMenu] = useState<{
  //   open: boolean
  //   x: number
  //   y: number
  //   file: FileNode | null
  // }>({ open: false, x: 0, y: 0, file: null })

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
              padding: "0 8px", // padding around each file
              gap: 6, // gap between filename and file close button
              // active file highlight under active or non-active tab
              background:
                activeFileId === file.id
                  ? (isActiveTab
                    ? activeFileUnderActiveTabBgr 
                    : activeFileBackground)
                  : undefined,
              borderBottom: 
                activeFileId === file.id 
                  ? activeFileBorder
                  : undefined,
          }}> 
            {/* filename */}
            <button
              ref={btnRef}
              onClick={() => {
                if (!isActiveTab) switchActiveTab(tabId)
                if (activeFileId !== file.id) switchActiveFile(tabId, file)
              }}
              // dropdown on right-click on filename
              onContextMenu={(e) => {
                e.preventDefault()
                btnRef.current = e.currentTarget
                setDropdownIsOpen(true)
                // setDropdownMenu({ open: true, x: e.clientX, y: e.clientY, file })
              }}
              style={{
                padding: "0 5px", // padding around fileanme
                cursor: "pointer",
                fontSize: fileFontSize,
                fontWeight: activeFileId === file.id ? 600 : 400,
                opacity: activeFileId === file.id ? 1 : 0.8,
              }}
            >
              {file.name}
            </button>
              {/* Dropdown */}
              <DropdownOverlay
                dropdownIsOpen={dropdownIsOpen}
                setDropdownIsOpen={() => setDropdownIsOpen(false)}
                parentRef={btnRef}
                align="center"
              >
                <button
                  onClick={() => {
                    openNewTab(file)
                  }}
                >
                  Split right
                </button>

                {/* TODO */}
                <button>
                  Copy Path
                </button>
              </DropdownOverlay>

            {/* file close button */}
            <button
              onClick={() => closeFile(tabId, file)}
              style={{
                paddingRight: "5px", // align padding with filename padding
                cursor: "pointer",
              }}
            >
              <ToolbarIcon whiteIcon={xIcon} onlyWhiteIcon={true} size={16} />
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
          cursor: "pointer"
        }}
      >
        <button onClick={() => closeTab(tabId)}>
          <ToolbarIcon whiteIcon={xIcon} onlyWhiteIcon={true} size={18} />
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

  </>
  )
}

export default Tab
