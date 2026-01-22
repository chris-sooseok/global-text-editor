import { create } from 'zustand'

const EDITOR_DEFAULT_THEME = import.meta.env.VITE_EDITOR_DEFAULT_THEME

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE
const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

const FILE_FONT_SIZE = import.meta.env.VITE_FILE_FONT_SIZE
const ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND = import.meta.env.VITE_ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND
const ACTIVE_FILE_BORDER = import.meta.env.VITE_ACTIVE_FILE_BORDER
const ACTIVE_FILE_BACKGROUND = import.meta.env.VITE_ACTIVE_FILE_BACKGROUND

const DROPDOWN_BORDER_WHITE=import.meta.env.VITE_DROPDOWN_BORDER_WHITE
const DROPDOWN_BACKGROUND_WHITE=import.meta.env.VITE_DROPDOWN_BACKGROUND_WHITE
const DROPDOWN_COLOR_WHITE=import.meta.env.VITE_DROPDOWN_COLOR_WHITE
const DROPDOWN_HIGHLIGHT=import.meta.env.VITE_DROPDOWN_HIGHLIGHT

export type themeType = "black" | "white"

type themeManagerStore = {
    editorTheme: themeType
    editorBackground: string,
    toolbarBackground: string,

    fileFontSize: string,

    activeFileUnderActiveTabBgr: string,
    activeFileBorder: string,
    activeFileBackground: string,

    dropdownBorder: string,
    dropdownBackground: string,
    dropdownColor: string,
    dropdownHighlight: string,

    switchEditorBackground: () => void,
}

export const ThemeManagerStore = create<themeManagerStore>((set) => {
  const editorTheme: themeType = EDITOR_DEFAULT_THEME
  const editorBackground = EDITOR_BACKGROUND_BLACK
  const toolbarBackground = TOOLBAR_BACKGROUND_BLACK

  const fileFontSize = FILE_FONT_SIZE

  const activeFileUnderActiveTabBgr = ACTIVE_FILE_UNDER_ACTIVE_TAB_BACKGROUND 
  const activeFileBorder = ACTIVE_FILE_BORDER
  const activeFileBackground = ACTIVE_FILE_BACKGROUND

  // we wont update these for now, but always possible
  const dropdownBorder = DROPDOWN_BORDER_WHITE
  const dropdownBackground = DROPDOWN_BACKGROUND_WHITE
  const dropdownColor = DROPDOWN_COLOR_WHITE
  const dropdownHighlight = DROPDOWN_HIGHLIGHT

  return {
    editorTheme: editorTheme,
    editorBackground: editorBackground,
    toolbarBackground: toolbarBackground,

    fileFontSize: fileFontSize,

    activeFileUnderActiveTabBgr: activeFileUnderActiveTabBgr,
    activeFileBorder: activeFileBorder,
    activeFileBackground: activeFileBackground,

    dropdownBorder: dropdownBorder,
    dropdownBackground: dropdownBackground,
    dropdownColor: dropdownColor,
    dropdownHighlight: dropdownHighlight,

    switchEditorBackground: () => {
      set((state) => {
        if (state.editorTheme === "black") {
          return {
            editorTheme: "white",
            editorBackground: EDITOR_BACKGROUND_WHITE,
            toolbarBackground: TOOLBAR_BACKGROUND_WHITE,
          }
        } else {
          return {
            editorTheme: "black",
            editorBackground: EDITOR_BACKGROUND_BLACK,
            toolbarBackground: TOOLBAR_BACKGROUND_BLACK,
          }
        }
      }
    )},



}
})