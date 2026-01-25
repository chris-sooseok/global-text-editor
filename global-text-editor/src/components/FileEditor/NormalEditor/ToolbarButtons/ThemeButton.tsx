
import ToolbarIcon from "shared/ToolbarIcon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"
import { ThemeManagerStore, type EditorTheme } from "store/ThemeStore/ThemeManagerStore"

function ThemeButton({
  fileId,
}: {
  fileId: number
  editorTheme: EditorTheme
}) {

  const editorTheme = ThemeManagerStore((s) => 
    s.fileConfigByFileId[fileId]?.editorTheme ?? "black")

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        if (editorTheme === "black") {
          ThemeManagerStore.getState().changeFileConfig(fileId, { editorTheme: "white" })
        }else{
          ThemeManagerStore.getState().changeFileConfig(fileId, { editorTheme: "black" })
        }
      }}
    >
    {editorTheme === "black"
      ? <ToolbarIcon 
        blackIcon={blackMoonIcon}
        whiteIcon={whiteMoonIcon}
        editorTheme={editorTheme}
      />
      : <ToolbarIcon 
        blackIcon={blackSunIcon}
        whiteIcon={whiteSunIcon}
        editorTheme={editorTheme}
      />
    }

    </button>
  )
}

export default ThemeButton
