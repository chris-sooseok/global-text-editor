import type { FileNode } from "../FsTreeStore/FsTreeTypes"

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

  localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))
  localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
  localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
  

  return {
    activeTabId: nextActiveTabId,
    tabIds: nextTabIds,
    activeFileByTabIds: nextActiveFileByTabIds,
    filesByTabIds: nextFilesByTabIds,
    
  }
}