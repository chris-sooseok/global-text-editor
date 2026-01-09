// TabGroup.tsx
import { useState } from "react"
import FileContent from "./FileContent/FileContent"

type TabGroupProps = {
  groupId: string
  canClose: boolean
  onAddTabGroup: () => void
  onCloseTabGroup: (groupId: string) => void
}

function TabGroup({ groupId, canClose, onAddTabGroup, onCloseTabGroup }: TabGroupProps) {
  const [fileTabs] = useState<string[]>([])

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
            onClick={() => onCloseTabGroup(groupId)}
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

export default TabGroup
