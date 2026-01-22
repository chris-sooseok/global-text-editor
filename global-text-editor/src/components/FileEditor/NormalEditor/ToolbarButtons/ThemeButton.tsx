
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import ToolbarIcon from "shared/ToolbarIcon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"

function ThemeButton() {

  const editorBackground = ThemeManagerStore((s) => s.editorBackground)
  const switchEditorBackground = ThemeManagerStore((s) => s.switchEditorBackground)
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        switchEditorBackground()
      }}
    >
    {editorBackground === "black"
      ? <ToolbarIcon 
        blackIcon={blackMoonIcon}
        whiteIcon={whiteMoonIcon}
      />
      : <ToolbarIcon 
        blackIcon={blackSunIcon}
        whiteIcon={whiteSunIcon}
      />
    }

    </button>
  )
}

export default ThemeButton
