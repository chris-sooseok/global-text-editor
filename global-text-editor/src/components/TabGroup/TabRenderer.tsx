// TabGroupRenderer.tsx
import { useState } from "react"
import Tab from "./Tab"

import { TabManagerStore } from "../../store/TabManagerStore/tabManagerStore"
import type { FileNode } from "../../store/FsTreeStore/FsTreeTypes"

/** Plans
 * 
 * Subscribes to activeTabId and tabIds. activeTabId allows highlighting each tab
 * is active, and tabIds will loop through to display all tabs.
 * 
 * Support switch activeTab
 *  - switchActiveTab(tabId)
 * 
 * Will loop through tabIds to render all tabs. Concern on this on activeTab switch
 * new tab being added is okay as long as you provide the right id 
 * 
 */


function TabRenderer() {

  const tabIsRendered = TabManagerStore((s) => s.tabIsVisible)

  // Tab where a selected file goes to
  const activeTabId = TabManagerStore((s) => s.activeTabId)
  const tabIds = TabManagerStore((s) => s.tabIds)
  const switchActiveTab = TabManagerStore((s) => s.switchActiveTab)

  return <>
    {tabIsRendered ? (
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
  \</>  
  }

export default TabRenderer
