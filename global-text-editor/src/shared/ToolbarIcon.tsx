
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"

function ToolbarIcon({
  blackIcon,
  whiteIcon,
  alt = "",
  size = 18,
  onlyBlackIcon = false,
  onlyWhiteIcon = false
}: {
  blackIcon?: string
  whiteIcon?: string
  alt?: string
  size?: number
  onlyBlackIcon?: boolean
  onlyWhiteIcon?: boolean
}) {
  let editorTheme
  if (blackIcon && whiteIcon) {
    editorTheme = ThemeManagerStore((s) => s.editorTheme)
  }
   
  return (
    <img
      src={onlyBlackIcon ? blackIcon :
            onlyWhiteIcon ? whiteIcon :
            editorTheme === "black" ? whiteIcon : blackIcon}
      alt={alt}
      aria-hidden={alt === ""}
      style={{ width: size, height: size, display: "block" }}
    />
  )
}

export default ToolbarIcon
