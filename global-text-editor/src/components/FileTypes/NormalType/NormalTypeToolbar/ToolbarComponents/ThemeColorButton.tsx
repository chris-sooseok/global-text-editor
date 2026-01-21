
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"

import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"


function ThemeColorButton({
  isLight,
  setIsLight,
}: {
  isLight: boolean
  setIsLight: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onMouseDown={(e) => {
        e.preventDefault()
        setIsLight((v) => !v)
      }}
      style={{
        background: isLight ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      Bg
    </button>
  )
}

export default ThemeColorButton
