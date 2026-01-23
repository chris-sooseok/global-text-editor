import { type Dispatch, type SetStateAction } from "react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"

function ThemeButton({
  fileId,
  editorTheme,
  setEditorTheme
}: {
  fileId: number
  editorTheme: "black" | "white"
  setEditorTheme: Dispatch<SetStateAction<"black"|"white">>
}) {

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        if (editorTheme === "black") {
          setEditorTheme("white")
          window.api.switchEditorTheme(fileId, "white")
        }else{
          setEditorTheme("black")
          window.api.switchEditorTheme(fileId, "black")
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
