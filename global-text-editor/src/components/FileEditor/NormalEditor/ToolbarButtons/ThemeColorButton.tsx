
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "shared/ToolbarIcon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"

function ThemeColorButton({
  themeColor,
  setThemeColor,
}: {
  themeColor: themeColorType
  setThemeColor: React.Dispatch<React.SetStateAction<themeColorType>>
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        setThemeColor((prev) => (prev === "black" ? "white" : "black"))
      }}
    >
    {themeColor === "black"
      ? <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackMoonIcon}
        whiteIcon={whiteMoonIcon}
      />
      : <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackSunIcon}
        whiteIcon={whiteSunIcon}
      />
      
    }


    </button>
  )
}

export default ThemeColorButton
