// TabGroup.tsx
import { useState } from "react"
import FileContent from "./FileContent/FileContent"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"
import { TabManagerStore } from "../../store/TabManagerStore/tabManagerStore"

/** Plans
 * 
 * Each tab Instance can keep tiptap instance to reuse it to switch between file contents.
 * Originally, it was thought of that fileContent should own tiptap instance, but tab owning
 * it will be more efficient
 * 
 * Subscribes to activeFileByTabId and filesByTabId. activeFileByTabId allows to fast-lookup
 * to display fileContent, and filesByTabId allows displaying and switching between different
 * file options in the tab
 * 
 * Each tab has a close button
 *  - closeTab(tabId)
 * 
 * Each fileContent close button 
 *  - closeFile(tabId, file)
 * 
 * Each fileContent is switchable
 *  - switchActiveFile(file)
 * 
 * Each fileContent on right click will display dropdown menu, which has
 *  - onRightClickOnFile
 *    - createNewTab(file)
 * 
 */


const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)


function Tab({tabId}: {tabId: string}) {

  const activeFileByTabIds = TabManagerStore((s) => s.activeFileIdByTabIds)
  const filesByTabIds = TabManagerStore((s) => s.filesByTabIds)
  const switchActiveFile = TabManagerStore((s) => s.switchActiveFile)
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
          height: 44,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: "2px solid rgba(0,0,0,0.15)",
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        <div>Tabs placeholder</div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          <button
            onClick={() => closeTab(tabId)}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <FileContent />
      </div>
    </div>
  )
}

export default Tab
