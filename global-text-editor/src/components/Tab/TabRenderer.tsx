import Tab from "./Tab"
import { TabManagerStore } from "../../store/TabManagerStore/TabManagerStore"

/** 
 * TabRenderer renders tabs that exists in tabIds
 * Once a file is selected from Sidebar, it pushes the file
 * into attributes defined in TabManageerStore, and appends new
 * tab into tabIds
 */

function TabRenderer() {

  const tabIds = TabManagerStore((s) => s.tabIds)

  // TODO: consider adding dragging between tabs
  
  return (
  <>
    {/* Tab Containers */}
    <div
      style={{
        display: "flex", // horizontally rendering tabs
        // tabs should take all space
        width: "100%", 
        height: "100%",
        overflowX: "auto", // we allow tabs to grow overflow
        overflowY: "hidden",
      }}
    >

      {tabIds.map((tabId) => (
        <div
          key={tabId}
          style={{
            flex: "1 1 700px", // ✅ grow if space, never shrink below 794
            minWidth: 700,     // ✅ hard floor
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

