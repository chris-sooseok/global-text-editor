// TabGroup.tsx
import { useState } from "react"
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import xIcon from "assets/Tab/icons8-x-96.png"
import Icon from "shared/Icon"
import markdownIcon from 'assets/Sidebar/icons8-markdown-white-96.png'
import dateIcon from 'assets/Sidebar/icons8-date-white-96.png'
import { DropdownOverlay } from "shared/DropdownOverlay"
import type { FileNode } from "store/SidebarStore/FsTreeTypes"

export default function Tab({tabId}: {tabId: string}) {

  // styles
  const { 
    nodeFontSize, 
    activeFileUnderActiveTabBgr, 
    activeFileBorder, 
    activeFileBackground 
  } =ThemeManagerStore.getState()

  // tab logics
  const activeTabId = TabManagerStore((s) => s.activeTabId)
  const activeFile: FileNode | null =  TabManagerStore((s) => s.activeFileByTabIds)[tabId] ?? null
  const files = TabManagerStore((s) => s.filesByTabIds)[tabId] ?? []
  const isActiveTab = tabId === activeTabId
  
  if (!activeFile) return undefined
  
  const { 
    switchActiveTab, 
    switchActiveFile,
    openNewTab,
    closeFileInTab,
    closeTab 
  } = TabManagerStore.getState()

  // dropdown
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
  const [dropdownFile, setDropdownFile] = useState<FileNode | null>(null)

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
                switchActiveFile(tabId, file)
              }}
              // dropdown on right-click on filename
              onContextMenu={(e) => {
                e.preventDefault()
                setDropdownFile(file)
                setDropdown({ open: true, x: e.clientX, y: e.clientY })
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: 0,
                textAlign: "left", // left align filename
                padding: "0 5px", // padding around fileanme
                cursor: "pointer",
                fontSize: nodeFontSize,
                fontWeight: 300,
                opacity: activeFile.id === file.id ? 1 : 0.8,
              }}
            >
              { file.type === 'file' && file.fileType === 'markdown'
                ? <Icon icon={markdownIcon}/>
                : undefined
              }
              {/* Date Icon */}
              { file.type === 'file' && file.fileType === 'today'
                ? <Icon icon={dateIcon} />
                : undefined
              }
              {file.name}
            </button>
  
            {/* File Close Button */}
            <button
              tabIndex={-1}
              onClick={() => closeFileInTab(tabId, file)}
              style={{
                paddingRight: "5px", // align padding with filename padding
                cursor: "pointer",
              }}
            >
              <Icon icon={xIcon} size={16} />
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
          <Icon icon={xIcon} size={18} />
        </button>
      </div>
    </div>

    {/* Editor Renderer */}
    <div style={{ 
      flex: 1, // file editor takes up the renaming space
      minWidth: 0, // force width to shrink
      minHeight: 0, // force height to shrink 
    }}>
      <MarkdownEditor key={`${tabId}-editor`} tabId={tabId} />
    </div>

  </div>
  </>
  )
}
