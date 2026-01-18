import { create } from 'zustand'
import { parseLocalStorage } from '../../utils/utils'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'

const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)
const TAB_IS_VISIBLE = String(import.meta.env.VITE_TAB_IS_VISIBLE)

type FilesByTabIds = Record<string, FileNode[]>
type ActiveFileByTabIds = Record<string, number>

type tabManagerStore = {
  activeTabId: string | null
  tabIds: string[]
  activeFileByTabIds: ActiveFileByTabIds
  filesByTabIds: FilesByTabIds
  tabIsVisible: boolean
  // Sidebar
  openFileInActiveTab: (file: FileNode) => void
  // TabRenderer
  switchActiveTab: (tabId: string) => void
  // Tab
  openNewTab: (file: FileNode) => void
  switchActiveFile:(file: FileNode) => void
  closeFile: (tabId: string, file: FileNode) => void
  closeTab: (tabId: string) => void
}

// ensuring initial tab state and its visibility
function tabIsVisibleHandler(
    activeTabId: string | null,
    tabIds: string[],
    tabIsVisible: boolean,
    file: FileNode,
): boolean {
  // when some activeTabId exists, set it true
  if (!tabIsVisible && activeTabId !== null && tabIds.length > 0) {
    // ! enforce the initial tab state
    localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify({activeTabId: file.id}))
    localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify({activeTabId: [file]}))
    localStorage.setItem(TAB_IS_VISIBLE, JSON.stringify(true))
    return true
  }

  // when no activeTab, set it false
  if (tabIsVisible && activeTabId === null && tabIds.length === 0) {
    // ! enforce no tab status
    localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(null))
    localStorage.setItem(TABS_IDS, JSON.stringify([]))
    localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify({}))
    localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify({}))
    localStorage.setItem(TAB_IS_VISIBLE, JSON.stringify(false))
    return false
  }

  // if no matching, keep the previous
  return tabIsVisible
}

function persist(
  activeTabId: string | null,
  tabIds: string[],
  activeFileByTabIds: ActiveFileByTabIds,
  filesByTabIds: FilesByTabIds,
) {
  localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(activeTabId))
  localStorage.setItem(TABS_IDS, JSON.stringify(tabIds))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(activeFileByTabIds))
  localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(filesByTabIds))
}

export const TabManagerStore = create<tabManagerStore>((set) => {

  const activeTabId = parseLocalStorage<string | null>
    (localStorage.getItem(ACTIVE_TAB_ID), null)
  const tabIds = parseLocalStorage<string[]>
    (localStorage.getItem(TABS_IDS), [])
  const activeFileByTabIds = parseLocalStorage<ActiveFileByTabIds>
    (localStorage.getItem(ACTIVE_FILE_BY_TAB_IDS),{})
  const filesByTabIds = parseLocalStorage<FilesByTabIds>
    (localStorage.getItem(FILES_BY_TABS_IDS), {})
  const tabIsVisible = parseLocalStorage<boolean>
    (localStorage.getItem(TAB_IS_VISIBLE), false)

  return {
    activeTabId: activeTabId,
    tabIds: tabIds,
    activeFileByTabIds: activeFileByTabIds,
    filesByTabIds: filesByTabIds,
    tabIsVisible: tabIsVisible,
    
    openFileInActiveTab: (selectedFile: FileNode) => {
      set((state) => {
        let nextActiveTabId: string | null = state.activeTabId
        let nextTabIds: string[] = state.tabIds
        let nextActiveFileByTabIds: ActiveFileByTabIds = state.activeFileByTabIds
        let nextFilesByTabIds: FilesByTabIds = state.filesByTabIds
        let nextTabIsVisible: boolean = state.tabIsVisible

        if (!nextTabIsVisible) {
          nextActiveTabId = 'tab-1'
          nextTabIds = [nextActiveTabId]
          activeFileByTabIds[nextActiveTabId] = selectedFile.id
          filesByTabIds[nextActiveTabId] = [selectedFile]
          nextTabIsVisible = tabIsVisibleHandler(nextActiveTabId, nextTabIds, nextTabIsVisible, selectedFile)

          return {
            activeTabId: nextActiveTabId,
            tabIds: nextTabIds,
            activeFileByTabIds: nextActiveFileByTabIds,
            filesByTabIds: nextFilesByTabIds,
            tabIsVisible: nextTabIsVisible,
          }
        }
        // if false, no tab exists
        if (!nextTabIsVisible && nextActiveTabId === null && nextTabIds.length === 0) {
          nextActiveTabId = 'tab-1'
          nextTabIds = [nextActiveTabId]
          activeFileByTabIds[nextActiveTabId] = selectedFile.id
          filesByTabIds[nextActiveTabId] = [selectedFile]
          nextTabIsVisible = tabIsVisibleHandler(nextActiveTabId, nextTabIds)
          persist(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
          return {
            activeTabId: nextActiveTabId,
            tabIds: nextTabIds,
            activeFileByTabIds: nextActiveFileByTabIds,
            filesByTabIds: nextFilesByTabIds,
            tabIsVisible: tabIsVisibleHandler(nextActiveTabId, nextTabIds)
          }
        }
          
        // by this point, some tabId and its presense in tabIds are must
        const filesInActiveTab: FileNode[] = nextFilesByTabIds[nextActiveTabId]
        const fileIsPresent: boolean = filesInActiveTab.some((file) => file.id === selectedFile.id)

        // if file already exists in the active tab, and is already activeFile
        if (fileIsPresent) {
          const activeFileId: number = nextActiveFileByTabIds[nextActiveTabId]
          if (activeFileId === selectedFile.id) {
            return {

            }
          }
        }
  

        // check if activeTab already contains the file
        const prevFilesByTabIds = state.filesByTabIds[nextActiveTab] ?? []
        const existingFilesByTab: boolean = prevFilesByTabIds.some((file) => file.id === selectedFile.id)


        const nextFilesByTab: FilesByTabIds= { ...state.filesByTabIds }
        // assign new file list with the selected file
        nextFilesByTab[nextActiveTab] = existingFilesByTab ? prevFilesByTabIds : [...prevFilesByTabIds, selectedFile]

        // 3) mark active file for that tab group
        const nextActiveFileByTab: Record<string, number> = { ...state.activeFileByTabIds }
        nextActiveFileByTab[nextActiveTab] = selectedFile.id

        persist(nextActiveTab, nextTabIds, nextActiveFileByTab, nextFilesByTab)

        return {
          tabIds: nextTabIds,
          activeTabId: nextActiveTab,
          tabsByGroup: nextFilesByTab,
          activeFileByGroup: nextActiveFileByTab,
        }
      })
    },

    switchActiveTab: (tabId: string) => {

    },

    openNewTab: (file: FileNode) => {

    },

    switchActiveFile: (file: FileNode) => {

    },

    closeFile: (tabId: string, file: FileNode) => {
      set((state) => {
        let nextActiveTabId: string | null
        let nextTabIds: string[]
        let nextActiveFileByTabIds: ActiveFileByTabIds
        let nextFilesByTabIds: FilesByTabIds
        let nextTabIsVisible: boolean

        const curActiveTabId = state.activeTabId
        const curTabIds = state.tabIds
        const curFilesByTabIds = state.filesByTabIds
        const curActiveFileByTabIds = state.activeFileByTabIds
      
        // if this is not active file, it means there is at least two in files in this tab
        // simply delete the unactive file
        if (curActiveFileByTabIds[tabId] !== file.id && curFilesByTabIds[tabId].length > 1) {
          
        }

        // if it is active file, and there is at least more than one file
        // set next file to the neigbor file
        if (curActiveFileByTabIds[tabId] === file.id && curFilesByTabIds[tabId].length > 1) {

        }

        // by this point, there is only one file (active) in the tab
        // close the tab
        if (curActiveFileByTabIds[tabId] === file.id && curFilesByTabIds[tabId].length === 0){

        }

        return {
          activeTabId: nextActiveTabId,
          tabIds: nextTabIds,
          activeFileByTabIds: nextActiveFileByTabIds,
          filesByTabIds: nextFilesByTabIds,
          tabIsVisible: nextTabIsVisible,
        }
      })
    },

    closeTab: (tabId: string) => {

    },

  }
})
