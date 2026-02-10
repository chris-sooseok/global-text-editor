import { create } from 'zustand'
import { parseLocalStorage } from 'shared/helperFunctions'
import type { FileNode } from '../SidebarStore/FsTreeTypes'
import { tabStateCommiter } from './TabMangerStoreHelper'
import { SidebarStore } from 'store/SidebarStore/SidebarStore'

const ACTIVE_TAB_ID = import.meta.env.VITE_ACTIVE_TAB_ID
const TABS_IDS = import.meta.env.VITE_TABS_IDS
const ACTIVE_FILE_BY_TAB_IDS = import.meta.env.VITE_ACTIVE_FILE_BY_TAB_IDS
const FILES_BY_TABS_IDS = import.meta.env.VITE_FILES_BY_TABS_IDS
const TAB_IDS_BY_FILE_IDS = import.meta.env.VITE_TAB_IDS_BY_FILE_IDS

export const DEFAULT_ACTIVE_TAB_ID = 'tab-1'

type tabManagerStore = {
  activeTabId: string
  tabIds: string[]
  activeFileByTabIds: Record<string, FileNode>
  filesByTabIds: Record<string, FileNode[]>
  tabIdsByFileIds: Record<number, string[]>
  // Sidebar
  openFileInActiveTab: (file: FileNode) => void
  renameFileInTab: (tabId: string, renameNodeId: number, newName: string) => void
  // TabRenderer
  switchActiveTab: (nextTabId: string) => void
  // Tab
  openNewTab: (copyingFile: FileNode) => void
  switchActiveFile:(tabId: string, nextFile: FileNode) => void
  closeFileInTab: (tabId: string, closingFile: FileNode) => void
  closeTab: (closingTabId: string) => void
}

export const TabManagerStore = create<tabManagerStore>()((set, get) => {

  const activeTabId = parseLocalStorage<string>
    (localStorage.getItem(ACTIVE_TAB_ID), DEFAULT_ACTIVE_TAB_ID)
  const tabIds = parseLocalStorage<string[]>
    (localStorage.getItem(TABS_IDS), [])
  const activeFileByTabIds = parseLocalStorage<Record<string, FileNode>>(
    localStorage.getItem(ACTIVE_FILE_BY_TAB_IDS),{})
  const filesByTabIds = parseLocalStorage<Record<string, FileNode[]>>(
    localStorage.getItem(FILES_BY_TABS_IDS), {})
  const tabIdsByFileIds = parseLocalStorage<Record<number, string[]>>(
    localStorage.getItem(TAB_IDS_BY_FILE_IDS), {})

  return {
    activeTabId: activeTabId,
    tabIds: tabIds,
    activeFileByTabIds: activeFileByTabIds,
    filesByTabIds: filesByTabIds,
    tabIdsByFileIds: tabIdsByFileIds,
    
    openFileInActiveTab: (selectedFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        const curTabIdsByFileIds: Record<number, string[]> = state.tabIdsByFileIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds:Record<string, FileNode>  = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}
        let nextTabIdsByFileIds = {...curTabIdsByFileIds}

        // no tab exists, create the first tab
        if (curTabIds.length === 0) {
          nextActiveTabId = DEFAULT_ACTIVE_TAB_ID
          nextTabIds = [nextActiveTabId]
          nextActiveFileByTabIds = {[nextActiveTabId]: selectedFile}
          nextFilesByTabIds = {[nextActiveTabId]: [selectedFile]}
          nextTabIdsByFileIds = {[selectedFile.id] : [nextActiveTabId]}
          return tabStateCommiter(nextActiveTabId, nextTabIds,
             nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds) 
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
            return tabStateCommiter(undefined, undefined, nextActiveFileByTabIds)
          }
        }
        
        // case 3 -> append selectedFile and set it as active file
        const existingFiles = nextFilesByTabIds[curActiveTabId] ?? []
        nextFilesByTabIds[curActiveTabId] = [...existingFiles, selectedFile]
        nextActiveFileByTabIds[curActiveTabId] = selectedFile
        nextTabIdsByFileIds[selectedFile.id] = [...curTabIdsByFileIds[selectedFile.id] ?? [], curActiveTabId]
        return tabStateCommiter(undefined, undefined, 
          nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
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
      return tabStateCommiter(undefined, undefined, undefined, nextFilesByTabIds)
    }),

    switchActiveTab: (nextTabId: string) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        let nextActiveTabId = curActiveTabId

        // if nextTabId is currently active tab, do nothing
        if (curActiveTabId === nextTabId) return state

        nextActiveTabId = nextTabId
        return tabStateCommiter(nextActiveTabId)
      })
    },

    openNewTab: (copyingFile: FileNode) => {
  
      const { tabIds, activeTabId } = get()

      // if two tabs already exist, switch to other tab and open the file
      if (tabIds.length === 2) {
        const targetTabId = activeTabId === "tab-1" ? "tab-2" : "tab-1"
        get().switchActiveTab(targetTabId)
        get().openFileInActiveTab(copyingFile)
        return
      }

      // create the 2nd tab
      if (tabIds.length === 1) {
        set((state) => {
          const newTabId = "tab-2"
          const nextTabIds = [...state.tabIds, newTabId]
          const nextActiveTabId = newTabId
          const nextActiveFileByTabIds = { ...state.activeFileByTabIds, [newTabId]: copyingFile }
          const nextFilesByTabIds = { ...state.filesByTabIds, [newTabId]: [copyingFile] }
          const nextTabIdsByFileIds = {
            ...state.tabIdsByFileIds,
            [copyingFile.id]: [...(state.tabIdsByFileIds[copyingFile.id] ?? []), newTabId],
          }
          return tabStateCommiter(
            nextActiveTabId,
            nextTabIds,
            nextActiveFileByTabIds,
            nextFilesByTabIds,
            nextTabIdsByFileIds
          )
        })
      }

      // * This is code for more than two tabs logic. We restrict only two tabs to exist for current version
      // making sure not to add already existing tabId
      // const maxNum = Math.max(...curTabIds.map((id) => Number(id.split('-')[1])))
      // const newTabId = `tab-${maxNum + 1}`
      // nextActiveTabId = newTabId
      // nextTabIds = [...curTabIds, newTabId]
      // nextFilesByTabIds[newTabId] = [copyingFile]
      // nextActiveFileByTabIds[newTabId] = copyingFile
      // nextTabIdsByFileIds[copyingFile.id] = [...curTabIdsByFileIds[copyingFile.id] ?? [], newTabId]     
      // return tabStateCommiter(nextActiveTabId, nextTabIds,
      //    nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
    },

    switchActiveFile: (tabId: string, nextFile: FileNode) => {
      set((state) => {
        const curActiveFileByTabIds = state.activeFileByTabIds
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        // ! update active file to the selected file 
        const { setActiveFile } = SidebarStore.getState()
        setActiveFile(nextFile)
        if (curActiveFileByTabIds[tabId].id === nextFile.id) return state
        nextActiveFileByTabIds[tabId] = nextFile
        return tabStateCommiter(undefined, undefined, nextActiveFileByTabIds)})
    },

    closeFileInTab: (tabId: string, closingFile: FileNode) => {
      set((state) => {
        const curActiveTabId: string = state.activeTabId
        const curTabIds: string[] = state.tabIds
        const curActiveFileByTabIds: Record<string, FileNode> = state.activeFileByTabIds
        const curFilesByTabIds: Record<string, FileNode[]> = state.filesByTabIds
        const curTabIdsByFileIds: Record<number, string[]> = state.tabIdsByFileIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}
        let nextTabIdsByFileIds = {...curTabIdsByFileIds}

        // ! when a file is closed, tabIdsByFileIds should remove tabId which the closing file id is in
        nextTabIdsByFileIds[closingFile.id] = curTabIdsByFileIds[closingFile.id].filter((tid) => tid !== tabId)

        const curActiveFile = curActiveFileByTabIds[tabId]
        const lenOfFilesInTab = curFilesByTabIds[tabId].length
        
        /** closingFile is not active file, it means there is at least two files in this tab
         * -> simply close the non-active file */
        if (curActiveFile.id !== closingFile.id && lenOfFilesInTab > 1) {
          nextFilesByTabIds[tabId] = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id )
          return tabStateCommiter(undefined, undefined, undefined, 
            nextFilesByTabIds, nextTabIdsByFileIds)
        }

        /** closingFile is the active file, and the tab has at least two files
         * -> apply "set neighboring file" logic */
        if (curActiveFile.id === closingFile.id && lenOfFilesInTab > 1) {
          // if there are only two files, set leftover file to the next active file
          if (lenOfFilesInTab === 2) {
            const remainingFile: FileNode = curFilesByTabIds[tabId].filter((f) => f.id !== closingFile.id)[0]
            nextActiveFileByTabIds[tabId] = remainingFile
            nextFilesByTabIds[tabId] = [remainingFile]
            return tabStateCommiter(undefined, undefined,
              nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds
            )

          } else {
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

            return tabStateCommiter(undefined, undefined,
              nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
          }
        }

        /** by this point, there is only one active file in tabId
         * -> close the tab */
        if (curActiveFile.id === closingFile.id && lenOfFilesInTab === 1){
          
          // if closing tab is the last tab, set every state to default
          if (curTabIds.length === 1) {
            return tabStateCommiter(DEFAULT_ACTIVE_TAB_ID, [], {}, {}, {}) 
          }
          
          // if the tab that has closing file is not active tab -> simply close it
          if (curActiveTabId !== tabId) {
            nextTabIds = curTabIds.filter((id) => id !== tabId)
            delete nextActiveFileByTabIds[tabId]
            delete nextFilesByTabIds[tabId]
            return tabStateCommiter(undefined,
              nextTabIds, nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
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
            return tabStateCommiter(nextActiveTabId, nextTabIds,
               nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
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
          return tabStateCommiter(nextActiveTabId, nextTabIds,
            nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)  
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
        const curTabIdsByFileIds: Record<number, string[]> = state.tabIdsByFileIds
        let nextActiveTabId = curActiveTabId
        let nextTabIds = [...curTabIds]
        let nextActiveFileByTabIds = {...curActiveFileByTabIds}
        let nextFilesByTabIds = {...curFilesByTabIds}
        let nextTabIdsByFileIds = {...curTabIdsByFileIds}

        // delete tab id in every files
        const filesByTabid = curFilesByTabIds[closingTabId]
        for (const file of filesByTabid) {
          nextTabIdsByFileIds[file.id] = curTabIdsByFileIds[file.id].filter((tid) => tid !== closingTabId)
        }
        
        // if closing tab is the last tab, set every state to default
        if (curTabIds.length === 1) {
          return tabStateCommiter(DEFAULT_ACTIVE_TAB_ID, [], {}, {}, {})
        }

        // if closing tab is not activeTab, simply close it
        if (closingTabId !== curActiveTabId) {
          nextTabIds = curTabIds.filter((id) => id !== closingTabId)
          delete nextActiveFileByTabIds[closingTabId]
          delete nextFilesByTabIds[closingTabId]
          return tabStateCommiter(undefined,
            nextTabIds,
            nextActiveFileByTabIds,
            nextFilesByTabIds,
            nextTabIdsByFileIds
          )
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
          return tabStateCommiter(nextActiveTabId, nextTabIds,
            nextActiveFileByTabIds, nextFilesByTabIds, nextTabIdsByFileIds)
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
        return tabStateCommiter(nextActiveTabId, nextTabIds, nextActiveFileByTabIds,
          nextFilesByTabIds, nextTabIdsByFileIds)  
      })
    },
      
  }
})