import Tab from "./Tab"
import { TabManagerStore } from "../../store/TabManagerStore/tabManagerStore"

function TabRenderer() {

  const tabIsVisible = TabManagerStore((s) => s.tabIsVisible)
  const tabIds = TabManagerStore((s) => s.tabIds)

  // TODO
  // consider adding dragging between tabs
  
  return (
    <>
      {tabIsVisible ? (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {tabIds.map((tabId) => (
            <div
              key={tabId}
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Tab tabId={tabId}/>
            </div>
          ))}
        </div>
      )
      : undefined
    }
  </>)
}

export default TabRenderer
