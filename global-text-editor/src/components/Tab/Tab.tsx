// TabGroup.tsx
import { useState, useRef } from "react"
import NormalEditor from "../FileEditor/NormalEditor/NormalEditor"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import xIcon from "assets/Tab/icons8-x-96.png"
import ToolbarIcon from "shared/ToolbarIcon"
import DropdownOverlay from "shared/DropdownOverlay"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"

type FileTypes = "Normal" | "Markdown" | "Canvas" 

function Tab({tabId}: {tabId: string}) {

  // styles
  const { 
    fileFontSize, 
    activeFileUnderActiveTabBgr, 
    activeFileBorder, 
    activeFileBackground 
  } =ThemeManagerStore.getState()

  // dropdown
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [dropdownFile, setDropdownFile] = useState<FileNode | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

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
  const closeFile = TabManagerStore((s) => s.closeFile)
  const closeTab = TabManagerStore((s) => s.closeTab)

  /** TODO: It is possible that localStorage may get corrupted, 
   * In that case, I need some strategy to normalize data
  */

  function renderEditorOnFileType() {
    return <>
        {/* {activeFile ? (
          <>
            {activeFile.fileType === "normal" && (
              <NormalEditor key="Normal" fileId={activeFile.id} />
            )}

            {activeFile.fileType === "markdown" && (
              <MarkdownEditor key="Markdown" fileId={activeFile.id} />
            )}

            {activeFile.fileType === "page" && (
              <CanvasEditor key="Canvas" fileId={activeFile.id} />
            )}
          </>
        ) : null}       */}
    </> 
  }

  function temp() {
    return <>
        <NormalEditor key="normal" activeFile={activeFile}/>
    </>
  }

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
              ref={btnRef}
              onClick={() => {
                if (!isActiveTab) switchActiveTab(tabId)
                if (activeFile.id !== file.id) switchActiveFile(tabId, file)
              }}
              // dropdown on right-click on filename
              onContextMenu={(e) => {
                e.preventDefault()
                btnRef.current = e.currentTarget
                setDropdownFile(file)
                setDropdownIsOpen(true)
              }}
              style={{
                padding: "0 5px", // padding around fileanme
                cursor: "pointer",
                fontSize: fileFontSize,
                fontWeight: activeFile.id === file.id ? 600 : 400,
                opacity: activeFile.id === file.id ? 1 : 0.8,
              }}
            >
              {file.name}
            </button>
  
            {/* File Clost Button */}
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
      {/* Dropdown */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        scrollable={true}
        align="center"
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            if (!dropdownFile) return
            openNewTab(dropdownFile)
            setDropdownIsOpen(false)
          }}
        >
          Split right
        </button>
        {/* TODO */}
        <button>
          Copy Path
        </button>
      </DropdownOverlay>

      {/* Tab Close Button */}
      <div style={{ display: "flex", alignItems: "center", paddingLeft: "15px", cursor: "pointer" }} >
        <button onClick={() => closeTab(tabId)}>
          <ToolbarIcon whiteIcon={xIcon} onlyWhiteIcon={true} size={18} />
        </button>
      </div>
    </div>

    {/* Editor Container */}
    <div style={{ 
      flex: 1, // file editor takes up the renaming space
      minWidth: 0, // force width shrink
      minHeight: 0, // force height shrink 
    }}>
      {/* {renderEditorOnFileType()} */}
      {temp()}
    </div>

  </div>
  </>
  )
}

export default Tab
