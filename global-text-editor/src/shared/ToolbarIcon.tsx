
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
  size = 20,
  onlyBlackIcon = false,
  onlyWhiteIcon = false,
  fileId,
  isActive = false
}: {
  blackIcon?: string
  whiteIcon?: string
  alt?: string
  size?: number
  onlyBlackIcon?: boolean
  onlyWhiteIcon?: boolean
  fileId?: number // use for editorTheme
  isActive?: boolean
}) {
  
  let editorTheme
  if (fileId) {
    editorTheme = ThemeManagerStore((s) => 
      s.fileConfigByFileId[fileId]?.editorTheme ?? "black")
  }

  return (
    <span
      style={{
        display: "flex",
        borderRadius: 6,
        outline: isActive ? "1px solid currentColor" : "none",
      }}
    >
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
          cursor: 'pointer',
        }}
      />
    </span>
  )
}

export default ToolbarIcon
