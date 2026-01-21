import Tab from "./Tab"
import { TabManagerStore } from "../../store/TabManagerStore/TabManagerStore"

function TabRenderer() {

  const tabIsVisible = TabManagerStore((s) => s.tabIsVisible)
  const tabIds = TabManagerStore((s) => s.tabIds)

  // TODO
  // consider adding dragging between tabs
  
  if (!tabIsVisible) return undefined

  return (
  <>
    {/* Tabs Container */}
    <div
      style={{
        display: "flex", // horizontally rendering tabs
        // tabs should take all space
        width: "100%", 
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Each Tab */}
      {tabIds.map((tabId) => (
        <div
          key={tabId}
          style={{
            flex: 1, // each tab takes up space
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Tab tabId={tabId}/>
        </div>
      ))}
    </div>
  </>)
}

export default TabRenderer
