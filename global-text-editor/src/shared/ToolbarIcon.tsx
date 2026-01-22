
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"

/**
 * 
 * @param param0 
 * @returns 
 */
function ToolbarIcon({
  blackIcon,
  whiteIcon,
  alt = "",
  size = 18,
  onlyBlackIcon = false
}: {
  blackIcon: string
  whiteIcon: string
  alt?: string
  size?: number
  onlyBlackIcon?: boolean
}) {

  const editorTheme = ThemeManagerStore((s) => s.editorTheme)
  return (
    <img
      src={onlyBlackIcon ? blackIcon :
        editorTheme === "black" ? whiteIcon : blackIcon}
      alt={alt}
      aria-hidden={alt === ""}
      style={{ width: size, height: size, display: "block" }}
    />
  )
}

export default ToolbarIcon
