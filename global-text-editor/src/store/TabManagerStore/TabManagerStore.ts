import { create } from 'zustand'
import { parseLocalStorage } from 'shared/parseLocalStorage'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'
import { tabStateCommiter } from './TabMangerStoreHelper'

const ACTIVE_TAB_ID = import.meta.env.VITE_ACTIVE_TAB_ID
const TABS_IDS = import.meta.env.VITE_TABS_IDS
const ACTIVE_FILE_BY_TAB_IDS = import.meta.env.VITE_ACTIVE_FILE_BY_TAB_IDS
const FILES_BY_TABS_IDS = import.meta.env.VITE_FILES_BY_TABS_IDS

export const DEFAULT_ACTIVE_TAB_ID = 'tab-1'

type tabManagerStore = {
  activeTabId: string
  tabIds: string[]
  activeFileByTabIds: Record<string, FileNode>
  filesByTabIds: Record<string, FileNode[]>
  // Sidebar
  openFileInActiveTab: (file: FileNode) => void
  renameFileInTab: (tabId: string, renameNodeId: number, newName: string) => void
  // TabRenderer
  switchActiveTab: (nextTabId: string) => void
  // Tab
  openNewTab: (copyingFile: FileNode) => void
  switchActiveFile:(tabId: string, nextFile: FileNode) => void
  closeFile: (tabId: string, closingFile: FileNode) => void
  closeTab: (closingTabId: string) => void
}

export const TabManagerStore = create<tabManagerStore>((set) => {

  const activeTabId = parseLocalStorage<string>
    (localStorage.getItem(ACTIVE_TAB_ID), DEFAULT_ACTIVE_TAB_ID)
  const tabIds = parseLocalStorage<string[]>
    (localStorage.getItem(TABS_IDS), [])
  const activeFileByTabIds = parseLocalStorage<Record<string, FileNode>>(
    localStorage.getItem(ACTIVE_FILE_BY_TAB_IDS),{})
  const filesByTabIds = parseLocalStorage<Record<string, FileNode[]>>(
    localStorage.getItem(FILES_BY_TABS_IDS), {})

  return {
    activeTabId: activeTabId,
    tabIds: tabIds,
    activeFileByTabIds: activeFileByTabIds,
    filesByTabIds: filesByTabIds,
    
    openFileInActiveTab: (selectedFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds:Record<string, FileNode>  = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // no tab exists, create the first tab
        if (curTabIds.length === 0) {
          nextActiveTabId = DEFAULT_ACTIVE_TAB_ID
          nextTabIds = [nextActiveTabId]
          nextActiveFileByTabIds = {[nextActiveTabId]: selectedFile}
          nextFilesByTabIds = {[nextActiveTabId]: [selectedFile]}
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds) 
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
          if (curActiveFileByTabIds[curActiveTabId].id === selectedFile.id) {
            return state
          } else {
            // case 2: current active tab has selectedFile, but not as active file
            // -> set its active file to the selectedFile 
            nextActiveFileByTabIds[curActiveTabId] = selectedFile
            localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
            return {activeFileByTabIds: nextActiveFileByTabIds}
          }
        }

        // case 3 -> append selectedFile and set it as active file
        const existingFiles = nextFilesByTabIds[curActiveTabId] ?? []
        nextFilesByTabIds[curActiveTabId] = [...existingFiles, selectedFile]
        nextActiveFileByTabIds[curActiveTabId] = selectedFile
        localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
        localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))

        return { activeFileByTabIds: nextActiveFileByTabIds, filesByTabIds: nextFilesByTabIds }
      })
    },

    renameFileInTab: (tabId: string, renameNodeId: number, newName: string) =>
      set((state) => {
        const nextFilesByTabIds = {
          ...state.filesByTabIds, // copy existing
          [tabId]: (state.filesByTabIds[tabId] ?? []).map((file) =>
            file.id === renameNodeId ? { ...file, name: newName } : file
          ),
        }

      localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))

      return { filesByTabIds: nextFilesByTabIds }
    }),

    switchActiveTab: (nextTabId: string) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        let nextActiveTabId = curActiveTabId

        // if nextTabId is currently active tab, do nothing
        if (curActiveTabId === nextTabId) return state

        nextActiveTabId = nextTabId
        localStorage.setItem(ACTIVE_TAB_ID, JSON.stringify(nextActiveTabId))

        return { activeTabId: nextActiveTabId }
      })
    },

    openNewTab: (copyingFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // making sure not to add already existing tabId
        const maxNum = Math.max(...curTabIds.map((id) => Number(id.split('-')[1])))
        const newTabId = `tab-${maxNum + 1}`
        nextActiveTabId = newTabId
        nextTabIds = [...curTabIds, newTabId]
        nextFilesByTabIds[newTabId] = [copyingFile]
        nextActiveFileByTabIds[newTabId] = copyingFile
        
        return tabStateCommiter( nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
      })
    },

    switchActiveFile: (tabId: string, nextFile: FileNode) => {
      set((state) => {
        const curActiveFileByTabIds = state.activeFileByTabIds
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}

        if (curActiveFileByTabIds[tabId].id === nextFile.id) return state

        nextActiveFileByTabIds[tabId] = nextFile
        localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
        return { activeFileByTabIds: nextActiveFileByTabIds }
      })
    },

    closeFile: (tabId: string, closingFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds

        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        const curActiveFile = curActiveFileByTabIds[tabId]
        const lenOfFilesInTab = curFilesByTabIds[tabId].length
        
        /** closingFile is not active file, it means there is at least two files in this tab
         * -> simply close the non-active file */
        if (curActiveFile.id !== closingFile.id && lenOfFilesInTab > 1) {
          nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id )
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
        }

        /** closingFile is the active file, and the tab has at least two files
         * -> apply "set neighboring file" logic */
        if (curActiveFile.id === closingFile.id && lenOfFilesInTab > 1) {
          // if there are only two files, set leftover file to the next active file
          if (lenOfFilesInTab === 2) {
            const remainingFile: FileNode = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id)[0]
            nextActiveFileByTabIds[tabId] = remainingFile
            nextFilesByTabIds[tabId] = [remainingFile]
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds) 
          }else {
            // if there are more than two files, apply different logics
            const idxOfClosingFile = curFilesByTabIds[tabId].findIndex((f) => f.id === closingFile.id)
            // closing file is the end file, set prev file to the active file
            if (idxOfClosingFile + 1 === lenOfFilesInTab) {
              nextActiveFileByTabIds[tabId] = curFilesByTabIds[tabId][idxOfClosingFile - 1]
            } else {
              // closing file is the first file or some middle file, set the next file as active file
              nextActiveFileByTabIds[tabId] = curFilesByTabIds[tabId][idxOfClosingFile + 1]
            }
            nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((file) => file.id !== closingFile.id )
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds) 
          }
        }

        /** by this point, there is only one active file in tabId
         * -> close the tab */
        if (curActiveFile.id === closingFile.id && lenOfFilesInTab === 1){
          
          // if closing tab is the last tab, set every state to default
          if (curTabIds.length === 1) {
            return tabStateCommiter(DEFAULT_ACTIVE_TAB_ID, [], {}, {}) 
          }
          
          // if the tab that has closing file is not active tab -> simply close it
          if (curActiveTabId !== tabId) {
            nextTabIds = curTabIds.filter((id) => id !== tabId)
            delete nextActiveFileByTabIds[tabId]
            delete nextFilesByTabIds[tabId]
            localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
            localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
            localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
            return { tabIds: nextTabIds, activeFileByTabIds: nextActiveFileByTabIds, filesByTabIds: nextFilesByTabIds }
          }

          // if tab that has closing file is the activeTab, apply these logics
          const idxOfActiveTab = curTabIds.findIndex((id) => id === tabId)
          const lenOfTabs = curTabIds.length

          // safe guard: set next tab to the first tab in tabIds
          if (idxOfActiveTab === -1) {
            nextTabIds = curTabIds.filter((id) => id !== tabId)
            nextActiveTabId = nextTabIds[0]
            delete nextFilesByTabIds[tabId]
            delete nextActiveFileByTabIds[tabId]
            return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
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
          delete nextActiveFileByTabIds[tabId]
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)  
          
        }

        // we covered all cases, simply return
        return state
      })
    },

    closeTab: (closingTabId: string) => {
      set((state) => {

        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds

        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}

        // if closing tab is the last tab, set every state to default
        if (curTabIds.length === 1) {
          return tabStateCommiter(DEFAULT_ACTIVE_TAB_ID, [], {}, {})
        }

        // if closing tab is not activeTab, simply close it
        if (closingTabId !== curActiveTabId) {
          nextTabIds = curTabIds.filter((id) => id !== closingTabId)
          delete nextActiveFileByTabIds[closingTabId]
          delete nextFilesByTabIds[closingTabId]
          localStorage.setItem(TABS_IDS, JSON.stringify(nextTabIds))
          localStorage.setItem(ACTIVE_FILE_BY_TAB_IDS, JSON.stringify(nextActiveFileByTabIds))
          localStorage.setItem(FILES_BY_TABS_IDS, JSON.stringify(nextFilesByTabIds))
          return { tabIds: nextTabIds, activeFileByTabIds: nextActiveFileByTabIds, filesByTabIds: nextFilesByTabIds }
        }

        // if closing tab is the activeTab, apply these logics
        const idxOfClosingTab = curTabIds.findIndex((id) => id === closingTabId)
        const lenOfTabs = curTabIds.length
  
        // safe guard: set next tab to the first tab in tabIds 
        if (idxOfClosingTab === -1) {
          nextTabIds = curTabIds.filter((id) => id !== closingTabId)
          nextActiveTabId = nextTabIds[0]
          delete nextFilesByTabIds[closingTabId]
          delete nextActiveFileByTabIds[closingTabId]
          return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)
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
        delete nextActiveFileByTabIds[closingTabId]
        return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds)  
      })
    },
      
  }
})