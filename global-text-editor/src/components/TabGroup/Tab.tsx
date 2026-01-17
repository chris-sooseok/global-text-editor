// TabGroup.tsx
import { useState } from "react"
import FileContent from "./FileContent/FileContent"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"

type TabGroupProps = {
  tabId: string
  canClose: boolean
  onAddTabGroup: () => void
  onCloseTabGroup: (groupId: string) => void
}

const FILES_BY_TABS_KEY = String(import.meta.env.VITE_FILES_BY_TABS_KEY)
const ACTIVE_FILE_BY_TAB_KEY = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)


function Tab({ tabId, canClose, onAddTabGroup, onCloseTabGroup }: TabGroupProps) {
  const [activeFile, setActiveFile] = useState<string | null>(() => {
      const raw = localStorage.getItem(ACTIVE_FILE_BY_TAB_KEY)
      if (!raw) return null

      try {
        const parsed = JSON.parse(raw)
        if (parsed[tabId]) return parsed[tabId]
        else return null
      } catch {
        return null
      }
  })

  const [files, setFiles] = useState<string[]>(() => {
    const raw = localStorage.getItem(FILES_BY_TABS_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (parsed[tabId]) return parsed[tabId]
      else return []
    } catch {
      return []
    }
  })

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
          <button onClick={onAddTabGroup}>+ </button>

          <button
            onClick={() => onCloseTabGroup(tabId)}
            disabled={!canClose} // prevents removing the last remaining group
            title={canClose ? "Close tab group" : "At least one tab group is required"}
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
