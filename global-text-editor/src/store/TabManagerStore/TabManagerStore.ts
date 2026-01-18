import { create } from 'zustand'
import { parseLocalStorage } from '../../utils/utils'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'

const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)
const TAB_IS_VISIBLE = String(import.meta.env.VITE_TAB_IS_VISIBLE)


type tabManagerStore = {
  activeTabId: string | null
  tabIds: string[]
  activeFileIdByTabIds: Record<string, number>
  filesByTabIds: Record<string, FileNode[]>
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
    nextActiveTabId: string | null,
    nextTabIds: string[],
    curTabIsVisible: boolean,
): boolean {
  // when some activeTabId exists, set it true
  if (!curTabIsVisible && nextActiveTabId !== null && nextTabIds.length > 0) {
    return !curTabIsVisible
  }

  // when no activeTab, set it false
  if (curTabIsVisible && nextActiveTabId === null && nextTabIds.length === 0) {
    return !curTabIsVisible
  }

  // if no matching, keep the previous
  return curTabIsVisible
}

function persist(
  activeTabId: string | null,
  tabIds: string[],
  activeFileByTabIds: Record<string, number>,
  filesByTabIds: Record<string, FileNode[]>,
  tabIsVisible: boolean
) {
  localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(activeTabId))
  localStorage.setItem(TABS_IDS, JSON.stringify(tabIds))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(activeFileByTabIds))
  localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(filesByTabIds))
  localStorage.setItem(TAB_IS_VISIBLE, JSON.stringify(tabIsVisible))
}

export const TabManagerStore = create<tabManagerStore>((set) => {

  const activeTabId = parseLocalStorage<string | null>
    (localStorage.getItem(ACTIVE_TAB_ID), null)
  const tabIds = parseLocalStorage<string[]>
    (localStorage.getItem(TABS_IDS), [])
  const activeFileIdByTabIds = parseLocalStorage<Record<string, number>>(
    localStorage.getItem(ACTIVE_FILE_BY_TAB_IDS),{})
  const filesByTabIds = parseLocalStorage<Record<string, FileNode[]>>(
    localStorage.getItem(FILES_BY_TABS_IDS), {})
  const tabIsVisible = parseLocalStorage<boolean>
    (localStorage.getItem(TAB_IS_VISIBLE), false)

  return {
    activeTabId: activeTabId,
    tabIds: tabIds,
    activeFileIdByTabIds: activeFileIdByTabIds,
    filesByTabIds: filesByTabIds,
    tabIsVisible: tabIsVisible,
    
    openFileInActiveTab: (selectedFile: FileNode) => {
      set((state) => {
        let nextActiveTabId: string | null = state.activeTabId
        let nextTabIds: string[] = state.tabIds
        let nextActiveFileByTabIds: Record<string, number> = state.activeFileIdByTabIds
        let nextFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        let nextTabIsVisible: boolean = state.tabIsVisible

        if (!nextTabIsVisible) {
          nextActiveTabId = 'tab-1'
          nextTabIds = [nextActiveTabId]
          activeFileIdByTabIds[nextActiveTabId] = selectedFile.id
          filesByTabIds[nextActiveTabId] = [selectedFile]
          nextTabIsVisible = tabIsVisibleHandler(nextActiveTabId, nextTabIds, nextTabIsVisible, selectedFile)

          return {
            activeTabId: nextActiveTabId,
            tabIds: nextTabIds,
            activeFileIdByTabIds: nextActiveFileByTabIds,
            filesByTabIds: nextFilesByTabIds,
            tabIsVisible: nextTabIsVisible,
          }
        }
        // if false, no tab exists
        if (!nextTabIsVisible && nextActiveTabId === null && nextTabIds.length === 0) {
          nextActiveTabId = 'tab-1'
          nextTabIds = [nextActiveTabId]
          activeFileIdByTabIds[nextActiveTabId] = selectedFile.id
          filesByTabIds[nextActiveTabId] = [selectedFile]
          nextTabIsVisible = tabIsVisibleHandler(nextActiveTabId, nextTabIds)
          persist(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
          return {
            activeTabId: nextActiveTabId,
            tabIds: nextTabIds,
            activeFileIdByTabIds: nextActiveFileByTabIds,
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


        const nextFilesByTab: Record<string, FileNode[]>= { ...state.filesByTabIds }
        // assign new file list with the selected file
        nextFilesByTab[nextActiveTab] = existingFilesByTab ? prevFilesByTabIds : [...prevFilesByTabIds, selectedFile]

        // 3) mark active file for that tab group
        const nextActiveFileByTab: Record<string, number> = { ...state.activeFileIdByTabIds }
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

    closeFile: (tabId: string, closingFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string | null = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        const curTabIsVisible: boolean = state.tabIsVisible

        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileIdByTabIds = {...curActiveFileIdByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        const lenOfFilesInTab = curFilesByTabIds[tabId].length
        const curActiveFileId = curActiveFileIdByTabIds[tabId]
      
        // if this is not active file, it means there is at least two files in this tab
        // simply delete the unactive file
        if (curActiveFileId !== closingFile.id && lenOfFilesInTab > 1) {
          nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((file) => file.id !== closingFile.id )
        }

        // if it is active file, and there is at least more than one file
        // set neighbor file to active file
        if (curActiveFileId === closingFile.id && lenOfFilesInTab > 1) {
          // if closing file is last second file, set the first file id to active file id
          if (lenOfFilesInTab === 2) {
            nextActiveFileIdByTabIds[tabId] = curFilesByTabIds[tabId][0].id
          }else {
            const idxOfActiveFile = curFilesByTabIds[tabId].findIndex((f) => f.id === closingFile.id)
            // if closing file is the last file, set prev file to active file
            if (idxOfActiveFile + 1 === lenOfFilesInTab) {
              nextActiveFileIdByTabIds[tabId] = curFilesByTabIds[tabId][idxOfActiveFile - 1].id
            }
            // if closing file is some file in the middle, set the next file as active file
            nextActiveFileIdByTabIds[tabId] = curFilesByTabIds[tabId][idxOfActiveFile + 1].id
          }
        }

        nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((file) => file.id !== closingFile.id )

        // by this point, there is only one active file in this tab
        // close the tab
        if (curActiveFileId === closingFile.id && lenOfFilesInTab === 1){
          const numOfTabs = curTabIds.length

          // if this is last tab, update tabIsVisible
          if (numOfTabs === 1) {
            nextActiveTabId = null
            nextTabIds = []
            nextActiveFileIdByTabIds = {}
            nextFilesByTabIds = {}
          } else {
            // if not last tab, simply delete the tab

            let idxOfActiveTab
            if (curActiveTabId) {
              idxOfActiveTab = curTabIds.findIndex((id) => id === tabId)
            }
            if (idxOfActiveTab !== undefined && idxOfActiveTab !== -1) {
              // if this is tab at the end, switch to previous tab
              if (idxOfActiveTab + 1 === numOfTabs) {
                nextActiveTabId = curTabIds[idxOfActiveTab - 1]
              } else {
                // if this is middle tab, switch to next tab
                nextActiveTabId = curTabIds[idxOfActiveTab + 1]
              }
            }
            nextTabIds = curTabIds.filter((ti) => ti !== tabId)
            delete nextFilesByTabIds[tabId]
            delete nextActiveFileIdByTabIds[tabId]
          }
        }

        persist(
          nextActiveTabId,
          nextTabIds,
          nextActiveFileIdByTabIds,
          nextFilesByTabIds,
          tabIsVisibleHandler(nextActiveTabId, nextTabIds, curTabIsVisible)
        )

        return {
          activeTabId: nextActiveTabId,
          tabIds: nextTabIds,
          activeFileIdByTabIds: nextActiveFileIdByTabIds,
          filesByTabIds: nextFilesByTabIds,
          tabIsVisible: tabIsVisibleHandler(nextActiveTabId, nextTabIds, curTabIsVisible),
        }
      })
    },

    closeTab: (tabId: string) => {

    },

  }
})
