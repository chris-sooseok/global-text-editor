// TabGroupRenderer.tsx
import { useState } from "react"
import TabGroup from "../TabGroup/TabGroup"

const TAB_GROUPS_KEY = String(import.meta.env.VITE_TAB_GROUPS_KEY)

let currentTab
let tabFiles

const activeTab = "activeTab"
const tabGrups = "tabGroups"

function TabGroupRenderer() {

  // const [activeTab, setActiveTab] = useState<string>(() => {
  //   const raw = localStorage.getItem(activeTab)
  //   if (!raw) return null

  //   try {
  //     return JSON.parse(raw)
  //   } catch {
  //     return null
  //   }
  // })

  const [tabGroups, setTabGroups] = useState<Map<string, string[]>>(() => {
    const raw = localStorage.getItem(TAB_GROUPS_KEY)
    if (!raw) return new Map()

    try {
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return new Map()
    }
  })

  function selectActiveTab() {

  }

  const handleAddTabGroup = () => {
    setTabGroups((prev) => {
      const next = new Map(prev)

      const groupName = `group-${prev.size + 1}`

      // key = groupName, value = empty list
      next.set(groupName, [])

      localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(Array.from(next.entries())))
      return next
    })
  }

  const handleCloseTabGroup = (groupId: string) => {
    setTabGroups((prev) => {
      if (prev.size === 1) return prev // keep at least one group

      const next = new Map(prev)
      next.delete(groupId) // delete key (and its value list)

      localStorage.setItem(TAB_GROUPS_KEY, JSON.stringify(Array.from(next.entries())))
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
