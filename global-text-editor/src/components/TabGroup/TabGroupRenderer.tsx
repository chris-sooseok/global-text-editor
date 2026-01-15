// TabGroupRenderer.tsx
import { useState } from "react"
import TabGroup from "../TabGroup/TabGroup"

const TAB_GROUPS_KEY = String(import.meta.env.VITE_TAB_GROUPS_KEY)

let currentTab
let tabFiles


function TabGroupRenderer() {
  const [tabGroups, setTabGroups] = useState<string[]>(() => {
    const json = localStorage.getItem(TAB_GROUPS_KEY)
    if (!json) return ["group-1"]

    try {
      return JSON.parse(json) // you said you'll only store an array here
    } catch {
      return ["group-1"]
    }
  })

  const handleAddTabGroup = () => {
    setTabGroups((prev) => {
      const next = [...prev, `group-${prev.length + 1}`]
      localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleCloseTabGroup = (groupId: string) => {
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
      {tabGroups.map((groupId) => (
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
      ))}
    </div>
  )
}

export default TabGroupRenderer
