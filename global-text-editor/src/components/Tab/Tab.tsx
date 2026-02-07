// TabGroup.tsx
import { useState, useRef } from "react"
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import xIcon from "assets/Tab/icons8-x-96.png"
import ToolbarIcon from "shared/ToolbarIcon"
import { DropdownOverlay } from "shared/DropdownOverlay"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"


function Tab({tabId}: {tabId: string}) {

  // styles
  const { 
    nodeFontSize, 
    activeFileUnderActiveTabBgr, 
    activeFileBorder, 
    activeFileBackground 
  } =ThemeManagerStore.getState()

  // dropdown
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
  const [dropdownFile, setDropdownFile] = useState<FileNode | null>(null)

  // tab logics
  const activeTabId = TabManagerStore((s) => s.activeTabId)
  const activeFileByTabIds = TabManagerStore((s) => s.activeFileByTabIds)
  const filesByTabIds = TabManagerStore((s) => s.filesByTabIds)
  const activeFile: FileNode = activeFileByTabIds[tabId]
  const files = filesByTabIds[tabId] ?? []
  const isActiveTab = tabId === activeTabId

  const switchActiveTab = TabManagerStore((s) => s.switchActiveTab)
  const switchActiveFile = TabManagerStore((s) => s.switchActiveFile)
  const openNewTab = TabManagerStore((s) => s.openNewTab)
  const closeFile = TabManagerStore((s) => s.closeFileInTab)
  const closeTab = TabManagerStore((s) => s.closeTab)

  /** TODO: It is possible that localStorage may get corrupted, 
   * In that case, I need some strategy to normalize data
  */

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
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Filename and Close Button */}
        {files.map((file) => (
          <div 
            key={file.id} 
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              padding: "0 8px", // padding around each file
              gap: 6, // gap between filename and file close button
              minWidth: 135, // minimum file width
              // active file highlight under active or non-active tab
              background:
                activeFile.id === file.id
                  ? (isActiveTab
                    ? activeFileUnderActiveTabBgr 
                    : activeFileBackground)
                  : undefined,
              borderBottom: 
                activeFile.id === file.id 
                  ? activeFileBorder
                  : undefined,
              flexShrink: 0 // prevent shrinking
          }}> 
            {/* Filename */}
            <button
              tabIndex={-1}
              onClick={() => {
                if (!isActiveTab) switchActiveTab(tabId)
                if (activeFile.id !== file.id) switchActiveFile(tabId, file)
              }}
              // dropdown on right-click on filename
              onContextMenu={(e) => {
                e.preventDefault()
                setDropdownFile(file)
                setDropdown({ open: true, x: e.clientX, y: e.clientY })
              }}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "left", // left align filename
                padding: "0 5px", // padding around fileanme
                cursor: "pointer",
                fontSize: nodeFontSize,
                fontWeight: activeFile.id === file.id ? 600 : 400,
                opacity: activeFile.id === file.id ? 1 : 0.8,
              }}
            >
              {file.name}
            </button>
  
            {/* File Clost Button */}
            <button
              tabIndex={-1}
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
      {/* Dropdown */}
      <DropdownOverlay
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            if (!dropdownFile) return
            openNewTab(dropdownFile)
            setDropdown({ open: false, x: 0, y: 0 })
          }}
        >
          {activeTabId === 'tab-1' ? "Split Right" : "Split Left"}
        </button>
        {/* TODO */}
        <button>
          Copy Path
        </button>
      </DropdownOverlay>

      {/* Tab Close Button */}
      <div style={{ display: "flex", alignItems: "center", paddingLeft: "15px", cursor: "pointer" }} >
        <button tabIndex={-1} onClick={() => closeTab(tabId)}>
          <ToolbarIcon whiteIcon={xIcon} onlyWhiteIcon={true} size={18} />
        </button>
      </div>
    </div>

    {/* Editor Container */}
    <div style={{ 
      flex: 1, // file editor takes up the renaming space
      minWidth: 0, // force width to shrink
      minHeight: 0, // force height to shrink 
    }}>
      <MarkdownEditor key="normal" activeFile={activeFile} tabId={tabId} />
    </div>

  </div>
  </>
  )
}

export default Tab
