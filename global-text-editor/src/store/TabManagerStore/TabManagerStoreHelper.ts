
import type { FileNode } from '../FsTreeStore/FsTreeTypes'
const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)
const TAB_IS_VISIBLE = String(import.meta.env.VITE_TAB_IS_VISIBLE)

const DEFAULT_ACTIVE_TAB_ID = 'tab-1'

/** Helps committing tab state
 * * Also, provide conveninet TabIsVisible update since all states need to
 * * be updated when TabIsVisible needs update
 */
export function tabStateCommitHelper(
  nextActiveTabId: string,
  nextTabIds: string[],
  nextActiveFileIdByTabIds: Record<string, number>,
  nextFilesByTabIds: Record<string, FileNode[]>,
) {
  const nextTabIsVisible = nextTabIds.length > 0

  if (!nextTabIsVisible) nextActiveTabId = DEFAULT_ACTIVE_TAB_ID

  localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))
  localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
  localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
  localStorage.setItem(TAB_IS_VISIBLE, JSON.stringify(nextTabIsVisible))

  return {
    activeTabId: nextActiveTabId,
    tabIds: nextTabIds,
    activeFileIdByTabIds: nextActiveFileIdByTabIds,
    filesByTabIds: nextFilesByTabIds,
    tabIsVisible: nextTabIsVisible,
  }
}