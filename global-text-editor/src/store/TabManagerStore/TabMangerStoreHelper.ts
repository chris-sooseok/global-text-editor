import type { FileNode } from "../FsTreeStore/FsTreeTypes"
import { DEFAULT_ACTIVE_TAB_ID } from "./TabManagerStore"

const TAB_IS_VISIBLE = String(import.meta.env.VITE_TAB_IS_VISIBLE)
const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_IDS)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)

/** Helps committing tab state
 * * Also, provide conveninet TabIsVisible update since all states need to
 * * be updated when TabIsVisible needs update
 */
export function tabStateCommiter(
  nextActiveTabId: string,
  nextTabIds: string[],
  nextActiveFileByTabIds: Record<string, FileNode>,
  nextFilesByTabIds: Record<string, FileNode[]>,
) {
  const nextTabIsVisible = nextTabIds.length > 0

  if (!nextTabIsVisible) nextActiveTabId = DEFAULT_ACTIVE_TAB_ID

  localStorage.setItem(TAB_IS_VISIBLE, JSON.stringify(nextTabIsVisible))
  localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))
  localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
  localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
  

  return {
    tabIsVisible: nextTabIsVisible,
    activeTabId: nextActiveTabId,
    tabIds: nextTabIds,
    activeFileByTabIds: nextActiveFileByTabIds,
    filesByTabIds: nextFilesByTabIds,
    
  }
}