
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"

/** 
 * ToolbarIcon is used inside 'button' element to display icon image for that button
 * This should be used whenever some icon needs to be displayed for some button
 * Since some buttons have special cases
 */
function ToolbarIcon({
  blackIcon,
  whiteIcon,
  alt = "",
  size = 18,
  onlyBlackIcon = false,
  onlyWhiteIcon = false,
  fileId
}: {
  blackIcon?: string
  whiteIcon?: string
  alt?: string
  size?: number
  onlyBlackIcon?: boolean
  onlyWhiteIcon?: boolean
  fileId?: number
}) {
  
  let editorTheme
  if (fileId) {
    editorTheme = ThemeManagerStore((s) => 
      s.fileConfigByFileId[fileId]?.editorTheme ?? "black")
  }

  return (
    <img
      src={onlyBlackIcon ? blackIcon :
            onlyWhiteIcon ? whiteIcon :
            editorTheme === "black" ? whiteIcon : blackIcon}
      alt={alt}
      aria-hidden={alt === ""}
      style={{ 
        width: size,
        height: size,
        display: "block",
        cursor: 'pointer'
      }}
    />
  )
}

export default ToolbarIcon
