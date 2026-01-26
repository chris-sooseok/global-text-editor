import type { FileNode } from "../FsTreeStore/FsTreeTypes"

const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_IDS)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)
const TAB_IDS_BY_FILE_IDS = import.meta.env.VITE_TAB_IDS_BY_FILE_IDS

/** Helps committing tab state
 * * Also, provide conveninet TabIsVisible update since all states need to
 * * be updated when TabIsVisible needs update
 */
export function tabStateCommiter(
  nextActiveTabId?: string,
  nextTabIds?: string[],
  nextActiveFileByTabIds?: Record<string, FileNode>,
  nextFilesByTabIds?: Record<string, FileNode[]>,
  nextTabIdsByFileIds?: Record<number, string[]>
) {

  // ! check undefined since null values can also be passed
  if (nextActiveTabId !== undefined) localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))
  if (nextTabIds !== undefined) localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
  if (nextActiveFileByTabIds !== undefined) localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
  if (nextFilesByTabIds !== undefined) localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
  if (nextTabIdsByFileIds !== undefined) localStorage.setItem(TAB_IDS_BY_FILE_IDS, JSON.stringify(nextTabIdsByFileIds))

  return {
    ...(nextActiveTabId !== undefined ? { activeTabId: nextActiveTabId } : {}),
    ...(nextTabIds !== undefined ? { tabIds: nextTabIds } : {}),
    ...(nextActiveFileByTabIds !== undefined ? { activeFileByTabIds: nextActiveFileByTabIds } : {}),
    ...(nextFilesByTabIds !== undefined ? { filesByTabIds: nextFilesByTabIds } : {}),
    ...(nextTabIdsByFileIds !== undefined ? { tabIdsByFileIds: nextTabIdsByFileIds } : {}),
  }
}