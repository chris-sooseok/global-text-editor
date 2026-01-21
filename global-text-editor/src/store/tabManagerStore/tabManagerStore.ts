import { create } from 'zustand'
import { parseLocalStorage } from '../../shared/utils'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'
import { tabStateCommiter } from './TabMangerStoreHelper'

const TAB_IS_VISIBLE = String(import.meta.env.VITE_TAB_IS_VISIBLE)
const ACTIVE_TAB_ID = String(import.meta.env.VITE_ACTIVE_TAB_ID)
const TABS_IDS = String(import.meta.env.VITE_TABS_IDS)
const ACTIVE_FILE_ID_BY_TAB_IDS = String(import.meta.env.VITE_ACTIVE_FILE_ID_BY_TAB_IDS)
const FILES_BY_TABS_IDS = String(import.meta.env.VITE_FILES_BY_TABS_IDS)


export const DEFAULT_ACTIVE_TAB_ID = 'tab-1'

type tabManagerStore = {
  tabIsVisible: boolean
  activeTabId: string
  tabIds: string[]
  activeFileIdByTabIds: Record<string, number>
  filesByTabIds: Record<string, FileNode[]>
  // Sidebar
  openFileInActiveTab: (file: FileNode) => void
  // TabRenderer
  switchActiveTab: (nextTabId: string) => void
  // Tab
  openNewTab: (copyingFile: FileNode) => void
  switchActiveFile:(tabId: string, nextFile: FileNode) => void
  closeFile: (tabId: string, closingFile: FileNode) => void
  closeTab: (closingTabId: string) => void
}

export const TabManagerStore = create<tabManagerStore>((set) => {

  const tabIsVisible = parseLocalStorage<boolean>
    (localStorage.getItem(TAB_IS_VISIBLE), false)
  const activeTabId = parseLocalStorage<string>
    (localStorage.getItem(ACTIVE_TAB_ID), DEFAULT_ACTIVE_TAB_ID)
  const tabIds = parseLocalStorage<string[]>
    (localStorage.getItem(TABS_IDS), [])
  const activeFileIdByTabIds = parseLocalStorage<Record<string, number>>(
    localStorage.getItem(ACTIVE_FILE_ID_BY_TAB_IDS),{})
  const filesByTabIds = parseLocalStorage<Record<string, FileNode[]>>(
    localStorage.getItem(FILES_BY_TABS_IDS), {})

  return {
    tabIsVisible: tabIsVisible,
    activeTabId: activeTabId,
    tabIds: tabIds,
    activeFileIdByTabIds: activeFileIdByTabIds,
    filesByTabIds: filesByTabIds,
    
    openFileInActiveTab: (selectedFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileIdByTabIds:Record<string, number>  = {...curActiveFileIdByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // no tab exists, create the first tab
        if (!state.tabIsVisible && curTabIds.length === 0) {
          nextActiveTabId = DEFAULT_ACTIVE_TAB_ID
          nextTabIds = [nextActiveTabId]
          nextActiveFileIdByTabIds = {[nextActiveTabId]: selectedFile.id}
          nextFilesByTabIds = {[nextActiveTabId]: [selectedFile]}
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds) 
        }

        /** If tab exists, we have three conditions
         * 1. if the selectedFile already exists in activeTab and is active file
         *  -> do nothing
         * 2. if the selectedFile already exists in activeTab, but is not active file
         *  -> switch active file
         * 3. if the selectedFile doesn't exist in activeTab
         *  -> append and set it as active file
         */

        // case 1 and 2
        const fileExists = curFilesByTabIds[curActiveTabId].find((f) => f.id === selectedFile.id)
        if (fileExists) {
          // case 1: current active tab's active file is the selectedFile 
          // -> do nothing
          if (curActiveFileIdByTabIds[curActiveTabId] === selectedFile.id) {
            return state
          } else {
            // case 2: current active tab has selectedFile, but not as active file
            // -> set its active file to the selectedFile 
            nextActiveFileIdByTabIds[curActiveTabId] = selectedFile.id
            localStorage.setItem(ACTIVE_FILE_ID_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
            return {
              tabIsVisible: state.tabIsVisible,
              activeTabId: nextActiveTabId,
              tabIds: nextTabIds,
              activeFileIdByTabIds: nextActiveFileIdByTabIds,
              filesByTabIds: nextFilesByTabIds,
            }
          }
        }

        // case 3 -> append selectedFile and set it as active file
        const existingFiles = nextFilesByTabIds[curActiveTabId] ?? []
        nextFilesByTabIds[curActiveTabId] = [...existingFiles, selectedFile]
        nextActiveFileIdByTabIds[curActiveTabId] = selectedFile.id
        localStorage.setItem(ACTIVE_FILE_ID_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
        localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))

        return {
          tabIsVisible: state.tabIsVisible,
          activeTabId: nextActiveTabId,
          tabIds: nextTabIds,
          activeFileIdByTabIds: nextActiveFileIdByTabIds,
          filesByTabIds: nextFilesByTabIds,
        }
      })
    },

    switchActiveTab: (nextTabId: string) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        let nextActiveTabId = curActiveTabId

        // if nextTabId is currently active tab, do nothing
        if (curActiveTabId === nextTabId) return state

        nextActiveTabId = nextTabId
        localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))

        return {
          tabIsVisible: state.tabIsVisible,
          activeTabId: nextActiveTabId,
          tabIds: state.tabIds,
          activeFileIdByTabIds: state.activeFileIdByTabIds,
          filesByTabIds: state.filesByTabIds,
        }
      })
    },

    openNewTab: (copyingFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileIdByTabIds = {...curActiveFileIdByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // making sure not to add already existing tabId
        const maxNum = Math.max(...curTabIds.map((id) => Number(id.split('-')[1])))
        const newTabId = `tab-${maxNum + 1}`
        nextActiveTabId = newTabId
        nextTabIds = [...curTabIds, newTabId]
        nextFilesByTabIds[newTabId] = [copyingFile]
        nextActiveFileIdByTabIds[newTabId] = copyingFile.id
        
        return tabStateCommiter(
          nextActiveTabId,
          nextTabIds,
          nextActiveFileIdByTabIds,
          nextFilesByTabIds
        )
      })
    },

    switchActiveFile: (tabId: string, nextFile: FileNode) => {
      set((state) => {
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        let nextActiveFileIdByTabIds = {...curActiveFileIdByTabIds}

        if (curActiveFileIdByTabIds[tabId] === nextFile.id) return state

        nextActiveFileIdByTabIds[tabId] = nextFile.id
        localStorage.setItem(ACTIVE_FILE_ID_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
        return {
            tabIsVisible: state.tabIsVisible,
            activeTabId: state.activeTabId,
            tabIds: state.tabIds,
            activeFileIdByTabIds: nextActiveFileIdByTabIds,
            filesByTabIds: state.filesByTabIds,
        }
      })
    },

    closeFile: (tabId: string, closingFile: FileNode) => {
      set((state) => {

        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds

        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileIdByTabIds = {...curActiveFileIdByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        const curActiveFileId = curActiveFileIdByTabIds[tabId]
        const lenOfFilesInTab = curFilesByTabIds[tabId].length
        
        /** closingFile is not active file, it means there is at least two files in this tab
         * -> simply close the non-active file */
        if (curActiveFileId !== closingFile.id && lenOfFilesInTab > 1) {
          nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id )
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds)
        }

        /** closingFile is the active file, and the tab has at least two files
         * -> apply "set neighboring file" logic */
        if (curActiveFileId === closingFile.id && lenOfFilesInTab > 1) {
          // if there are only two files, set leftover file to the next active file
          if (lenOfFilesInTab === 2) {
            const remainingFile: FileNode = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id)[0]
            nextActiveFileIdByTabIds[tabId] = remainingFile.id
            nextFilesByTabIds[tabId] = [remainingFile]
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds) 
          }else {
            // if there are more than two files, apply different logics
            const idxOfClosingFile = curFilesByTabIds[tabId].findIndex((f) => f.id === closingFile.id)
            // closing file is the end file, set prev file to the active file
            if (idxOfClosingFile + 1 === lenOfFilesInTab) {
              nextActiveFileIdByTabIds[tabId] = curFilesByTabIds[tabId][idxOfClosingFile - 1].id
            } else {
              // closing file is the first file or some middle file, set the next file as active file
              nextActiveFileIdByTabIds[tabId] = curFilesByTabIds[tabId][idxOfClosingFile + 1].id
            }
            nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((file) => file.id !== closingFile.id )
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds) 
          }
        }

        /** by this point, there is only one active file in tabId
         * -> close the tab */
        if (curActiveFileId === closingFile.id && lenOfFilesInTab === 1){
          
          // if closing tab is the last tab, set every state to default
          if (curTabIds.length === 1) {
            nextActiveTabId = DEFAULT_ACTIVE_TAB_ID
            nextTabIds = []
            nextActiveFileIdByTabIds = {}
            nextFilesByTabIds = {}
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds) 
          }
          
          // if the tab that has closing file is not active tab -> simply close it
          if (curActiveTabId !== tabId) {
            nextTabIds = curTabIds.filter((id) => id !== tabId)
            delete nextActiveFileIdByTabIds[tabId]
            delete nextFilesByTabIds[tabId]
            localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
            localStorage.setItem(ACTIVE_FILE_ID_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
            localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
            return {
              tabIsVisible: state.tabIsVisible,
              activeTabId: nextActiveTabId,
              tabIds: nextTabIds,
              activeFileIdByTabIds: nextActiveFileIdByTabIds,
              filesByTabIds: nextFilesByTabIds,
            }
          }

          // if tab that has closing file is the activeTab, apply these logics
          const idxOfActiveTab = curTabIds.findIndex((id) => id === tabId)
          const lenOfTabs = curTabIds.length

          // safe guard: set next tab to the first tab in tabIds
          if (idxOfActiveTab === -1) {
            nextTabIds = curTabIds.filter((id) => id !== tabId)
            nextActiveTabId = nextTabIds[0]
            delete nextFilesByTabIds[tabId]
            delete nextActiveFileIdByTabIds[tabId]
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds)
          }

          // if closing tab is the end tab, set prev tab to the active tab
          if (idxOfActiveTab + 1 === lenOfTabs) {
            nextActiveTabId = curTabIds[idxOfActiveTab - 1]
          } else {
            // if closing tab is the first or some middle tab, set the next tab as active tab
            nextActiveTabId = curTabIds[idxOfActiveTab + 1]
          }
          nextTabIds = curTabIds.filter((id) => id !== tabId)
          delete nextFilesByTabIds[tabId]
          delete nextActiveFileIdByTabIds[tabId]
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds)  
          
        }

        // we covered all cases, simply return
        return state
      })
    },

    closeTab: (closingTabId: string) => {
      set((state) => {

        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileIdByTabIds: Record<string, number> = state.activeFileIdByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds

        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileIdByTabIds = {...curActiveFileIdByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // if closing tab is the last tab, set every state to default
        if (curTabIds.length === 1) {
          nextActiveTabId = DEFAULT_ACTIVE_TAB_ID
          nextTabIds = []
          nextActiveFileIdByTabIds = {}
          nextFilesByTabIds = {}
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds) 
        }

        // if closing tab is not activeTab, simply close it
        if (closingTabId !== curActiveTabId) {
          nextTabIds = curTabIds.filter((id) => id !== closingTabId)
          delete nextActiveFileIdByTabIds[closingTabId]
          delete nextFilesByTabIds[closingTabId]
          localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
          localStorage.setItem(ACTIVE_FILE_ID_BY_TAB_IDS, JSON.stringify(nextActiveFileIdByTabIds))
          localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
          return {
            tabIsVisible: state.tabIsVisible,
            activeTabId: nextActiveTabId,
            tabIds: nextTabIds,
            activeFileIdByTabIds: nextActiveFileIdByTabIds,
            filesByTabIds: nextFilesByTabIds,
          }
        }

        // if closing tab is the activeTab, apply these logics
        const idxOfClosingTab = curTabIds.findIndex((id) => id === closingTabId)
        const lenOfTabs = curTabIds.length
  
        // safe guard: set next tab to the first tab in tabIds 
        if (idxOfClosingTab === -1) {
          nextTabIds = curTabIds.filter((id) => id !== closingTabId)
          nextActiveTabId = nextTabIds[0]
          delete nextFilesByTabIds[closingTabId]
          delete nextActiveFileIdByTabIds[closingTabId]
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds)
        }
        // if closing tab is the end tab, set prev tab to the active tab
        if (idxOfClosingTab + 1 === lenOfTabs) {
          
          nextActiveTabId = curTabIds[idxOfClosingTab - 1]
        } else {
          // if closing tab is the first or some middle tab, set the next tab as active tab
          nextActiveTabId = curTabIds[idxOfClosingTab + 1]
        }
        nextTabIds = curTabIds.filter((id) => id !== closingTabId)
        delete nextFilesByTabIds[closingTabId]
        delete nextActiveFileIdByTabIds[closingTabId]
        return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileIdByTabIds, nextFilesByTabIds)  
      })
    },

  }
})