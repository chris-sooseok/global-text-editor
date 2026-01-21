
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"

import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"

import type { themeColorType } from "../NormalEditor"

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
      aria-label="Toggle theme"
      onMouseDown={(e) => {
        e.preventDefault()
        setThemeColor((prev) => (prev === "black" ? "white" : "black"))
      }}
    >
      <img
        src={themeColor === "black" ? whiteSunIcon : blackSunIcon}
        alt=""
        width="25px"
        aria-hidden="true"
      />

    </button>
  )
}

export default ThemeColorButton
