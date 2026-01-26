import { create } from 'zustand'

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE
const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

const SIDEBAR_NODE_BGR = import.meta.env.VITE_SIDEBAR_NODE_BGR
const FILE_FONT_SIZE = import.meta.env.VITE_FILE_FONT_SIZE
const SIDEBAR_NODE_DRAG_TARGET = import.meta.env.VITE_SIDEBAR_NODE_DRAG_TARGET

const ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND = import.meta.env.VITE_ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND
const ACTIVE_FILE_BORDER = import.meta.env.VITE_ACTIVE_FILE_BORDER
const ACTIVE_FILE_BACKGROUND = import.meta.env.VITE_ACTIVE_FILE_BACKGROUND

const DROPDOWN_BORDER_WHITE=import.meta.env.VITE_DROPDOWN_BORDER_WHITE
const DROPDOWN_BACKGROUND_WHITE=import.meta.env.VITE_DROPDOWN_BACKGROUND_WHITE
const DROPDOWN_COLOR_WHITE=import.meta.env.VITE_DROPDOWN_COLOR_WHITE
const DROPDOWN_HIGHLIGHT=import.meta.env.VITE_DROPDOWN_HIGHLIGHT

export type EditorTheme = "black" | "white"
export type FileConfig = {
  editorTheme: EditorTheme
}

type ThemeManagerStoreType = {
    editorBackgroundBlack: string,
    toolbarBackgroundBlack: string,
    editorBackgroundWhite: string,
    toolbarBackgroundWhite: string,

    sidebarNodeBgr: string,
    fileFontSize: string,
    sidebar_node_drag_target: string,

    activeFileUnderActiveTabBgr: string,
    activeFileBorder: string,
    activeFileBackground: string,

    dropdownBorder: string,
    dropdownBackground: string,
    dropdownColor: string,
    dropdownHighlight: string,

    fileConfigByFileId: Record<number, FileConfig>
    loadFileConfig: (id: number) => Promise<void>
    changeFileConfig: (id: number, change: Partial<FileConfig>) => Promise<void>
}

export const ThemeManagerStore = create<ThemeManagerStoreType>((set, get) => ({
  editorBackgroundBlack: EDITOR_BACKGROUND_BLACK,
  toolbarBackgroundBlack: TOOLBAR_BACKGROUND_BLACK,
  editorBackgroundWhite: EDITOR_BACKGROUND_WHITE,
  toolbarBackgroundWhite: TOOLBAR_BACKGROUND_WHITE,

  sidebarNodeBgr: SIDEBAR_NODE_BGR,
  fileFontSize: FILE_FONT_SIZE,
  sidebar_node_drag_target: SIDEBAR_NODE_DRAG_TARGET,

  activeFileUnderActiveTabBgr: ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND,
  activeFileBorder: ACTIVE_FILE_BORDER,
  activeFileBackground: ACTIVE_FILE_BACKGROUND,

  dropdownBorder: DROPDOWN_BORDER_WHITE,
  dropdownBackground: DROPDOWN_BACKGROUND_WHITE,
  dropdownColor: DROPDOWN_COLOR_WHITE,
  dropdownHighlight: DROPDOWN_HIGHLIGHT,

  fileConfigByFileId: {},

  // make sure file config exists
  loadFileConfig: async (id) => {
    const res = await window.api.loadFileConfig(id)
    if (!res.ok) return

    set((state) => ({
      fileConfigByFileId: {
        ...state.fileConfigByFileId,
        [id]: {
          editorTheme: res.editorTheme,
          toolbarIsVisible: res.toolbarIsVisible,
        },
      },
    }))
  },

  changeFileConfig: async (id, change) => {
    // optimistic update
    set((state) => {
      const prev = state.fileConfigByFileId[id] ?? {
        editorTheme: "black" as EditorTheme,
        toolbarIsVisible: true,
      }

      return {
        fileConfigByFileId: {
          ...state.fileConfigByFileId,
          [id]: { ...prev, ...change },
        },
      }
    })

    // persist (call whichever IPC exists)
    if (change.editorTheme) {
      await window.api.changeTheme(id, change.editorTheme)
    }
  },
}))