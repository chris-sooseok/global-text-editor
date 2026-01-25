
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"

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
