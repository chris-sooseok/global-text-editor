import { create } from 'zustand'
import { parseLocalStorage } from '../../utils/utils'
import type { FileNode } from '../FsTreeStore/FsTreeTypes'

export type File = {fileId: number, name: string}

type TabGroupStore = {
  tabs: string[]
  activeTab: string | null
  filesByTab: Record<string, File[]>
  activeFileByTab: Record<string, number | null>
  openFileInActiveTab: (file: FileNode) => void
}

const ACTIVE_TAB_KEY = String(import.meta.env.VITE_ACTIVE_TAB_KEY)
const TABS_KEY = String(import.meta.env.VITE_TABS_KEY)
const FILES_BY_TABS_KEY = String(import.meta.env.VITE_FILES_BY_TABS_KEY)
const ACTIVE_FILE_BY_TAB_KEY = String(import.meta.env.VITE_ACTIVE_FILE_BY_TAB_KEY)

function persist(
  tabs: string[],
  activeTab: string | null,
  filesByTab: Record<string, File[]>,
  activeFileByTab: Record<string, number | null>
) {
  localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify(activeTab))
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
  localStorage.setItem(FILES_BY_TABS_KEY, JSON.stringify(filesByTab))
  localStorage.setItem(ACTIVE_FILE_BY_TAB_KEY, JSON.stringify(activeFileByTab))
}

export const TabGroupStore = create<TabGroupStore>((set) => {

  const tabs = parseLocalStorage<string[]>(localStorage.getItem(TABS_KEY), [])
  const activeTab = parseLocalStorage<string | null>(localStorage.getItem(ACTIVE_TAB_KEY), null)
  const filesByTab = parseLocalStorage<Record<string, File[]>>(localStorage.getItem(FILES_BY_TABS_KEY), {})
  const activeFileByTab = parseLocalStorage<Record<string, number | null>>(localStorage.getItem(ACTIVE_FILE_BY_TAB_KEY),{})

  return {
    tabs,
    activeTab,
    filesByTab,
    activeFileByTab,

    openFileInActiveTab: (selectedFile: FileNode) => {
        set((state) => {
            let nextActiveTab = state.activeTab
            let nextTabs = state.tabs

            // if no tabs exist yet, create a tab
            if (nextTabs.length === 0) {
                nextActiveTab = 'tab-1'
                nextTabs = [nextActiveTab]
            // if tabs don't contain the active tab
            } else if (!nextActiveTab || !nextTabs.includes(nextActiveTab)) {
                nextActiveTab = nextTabs[0]
            }
            
            // get files from the active tab
            const prevFilesByTab = state.filesByTab[nextActiveTab] ?? []
            // check if the selected file already exists in the active tab
            const existingFilesByTab: boolean = prevFilesByTab.some((tab) => tab.fileId === selectedFile.id)

            const nextFilesByTab: Record<string, File[]> = { ...state.filesByTab }
            // assign new file list with the selected file
            nextFilesByTab[nextActiveTab] = existingFilesByTab ? prevFilesByTab : [...prevFilesByTab, {
                fileId: selectedFile.id, name: selectedFile.name
            }]

            // 3) mark active file for that tab group
            const nextActiveFileByTab: Record<string, number | null> = { ...state.activeFileByTab }
            nextActiveFileByTab[nextActiveTab] = selectedFile.id

            persist(nextTabs, nextActiveTab, nextFilesByTab, nextActiveFileByTab)

                    return {
          tabs: nextTabs,
          activeTab: nextActiveTab,
          tabsByGroup: nextFilesByTab,
          activeFileByGroup: nextActiveFileByTab,
        }
        })
    },

    closeFile: () => {

    },
    // TODO
    openNewTab: () => {

    },

    closeTab: () => {

    },

  }
})
