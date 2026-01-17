// TabGroupRenderer.tsx
import { useState } from "react"
import Tab from "./Tab"
import { FileStore } from "../../store/tabManagerStore/tabManagerStore"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"

const ACTIVE_TAB_KEY = String(import.meta.env.VITE_ACTIVE_TAB_KEY)
const TABS_KEY = String(import.meta.env.VITE_TABS_KEY)

function TabRenderer() {

  const file: FileNode | null = FileStore((store) => store.file)

  // Tab where a selected file goes to
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    const raw = localStorage.getItem(ACTIVE_TAB_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const [tabs, setTabs] = useState<string[]>(() => {
    const raw = localStorage.getItem(TABS_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return []
    }
  })

  function addTabGroup() {
    setTabs((prev) => {
      const next = [...prev, `tab-group-${prev.length + 1}`]
      localStorage.setItem(TABS_KEY, JSON.stringify(next))
      return next
    })
  }

  function closeTabGroup(groupId: string) {
    setTabs((prev) => {
      if (prev.length === 1) return prev // keep at least one group
      const next = prev.filter((id) => id !== groupId)
      localStorage.setItem(TABS_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {tabs.map((groupId) => (
        <div
          key={groupId}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Tab
            tabId={groupId}
            canClose={tabs.length > 1}
            onAddTabGroup={addTabGroup}
            onCloseTabGroup={closeTabGroup}
          />
        </div>
      ))}
    </div>
  )
}

export default TabRenderer
