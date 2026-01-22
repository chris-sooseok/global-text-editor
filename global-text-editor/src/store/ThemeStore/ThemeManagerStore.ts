import { create } from 'zustand'

const EDITOR_DEFAULT_THEME = import.meta.env.VITE_EDITOR_DEFAULT_THEME

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE
const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

const DROPDOWN_BORDER_WHITE=import.meta.env.VITE_DROPDOWN_BORDER_WHITE
const DROPDOWN_BACKGROUND_WHITE=import.meta.env.VITE_DROPDOWN_BACKGROUND_WHITE
const DROPDOWN_COLOR_WHITE=import.meta.env.VITE_DROPDOWN_COLOR_WHITE
const DROPDOWN_HIGHLIGHT=import.meta.env.VITE_DROPDOWN_HIGHLIGHT

export type themeType = "black" | "white"

type themeStore = {
    editorTheme: themeType
    editorBackground: string,
    toolbarBackground: string,
    dropdownBordor: string,
    dropdownBackground: string,
    dropdownColor: string,
    dropdownHighlight: string,

    switchEditorBackground: () => void,
}

export const ThemeManagerStore = create<themeStore>((set) => {
  const editorTheme: themeType = EDITOR_DEFAULT_THEME
  const editorBackground = EDITOR_BACKGROUND_BLACK
  const toolbarBackground = TOOLBAR_BACKGROUND_BLACK

  // we wont update these for now, but always possible
  const dropdownBordor = DROPDOWN_BORDER_WHITE
  const dropdownBackground = DROPDOWN_BACKGROUND_WHITE
  const dropdownColor = DROPDOWN_COLOR_WHITE
  const dropdownHighlight = DROPDOWN_HIGHLIGHT

  return {
    editorTheme: editorTheme,
    editorBackground: editorBackground,
    toolbarBackground: toolbarBackground,
    dropdownBordor: dropdownBordor,
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