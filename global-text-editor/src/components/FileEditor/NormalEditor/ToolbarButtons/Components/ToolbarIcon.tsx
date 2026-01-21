import type { themeColorType } from "../../NormalEditor"

function ToolbarIcon({
  themeColor,
  blackIcon,
  whiteIcon,
  alt = "",
  size = 18,
}: {
  themeColor: themeColorType
  blackIcon: string
  whiteIcon: string
  alt?: string
  size?: number
}) {
  return (
    <img
      src={themeColor === "black" ? whiteIcon : blackIcon}
      alt={alt}
      aria-hidden={alt === ""}
      style={{ width: size, height: size, display: "block" }}
    />
  )
}

export default ToolbarIcon
