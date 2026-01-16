// TabGroupRenderer.tsx
import { useState } from "react"
import TabGroup from "../TabGroup/TabGroup"

const ACTIVE_TAB_KEY = String(import.meta.env.VITE_ACTIVE_TAB_KEY)
const TAB_GROUPS_KEY = String(import.meta.env.VITE_TAB_GROUPS_KEY)


function TabGroupRenderer() {

  // Tab where a selected file goes to
  const [activeTab, setActiveTab] = useState<string>(() => {
    const raw = localStorage.getItem(ACTIVE_TAB_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  const [tabGroups, setTabGroups] = useState<string[]>(() => {
    const raw = localStorage.getItem(TAB_GROUPS_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return []
    }
  })

  function addTabGroup() {
    setTabGroups((prev) => {
      const next = [...prev, `tab-group-${prev.length + 1}`]
      localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(next))
      return next
    })
  }

  function closeTabGroup(groupId: string) {
    setTabGroups((prev) => {
      if (prev.length === 1) return prev // keep at least one group
      const next = prev.filter((id) => id !== groupId)
      localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(next))
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
      {/* {tabGroups.map((groupId) => (
        <div
          key={groupId}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <TabGroup
            groupId={groupId}
            canClose={tabGroups.length > 1}
            onAddTabGroup={handleAddTabGroup}
            onCloseTabGroup={handleCloseTabGroup}
          />
        </div>
      ))} */}
    </div>
  )
}

export default TabGroupRenderer
