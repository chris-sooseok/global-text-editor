
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
type ToolbarIconProps = {
    blackIcon: string
    whiteIcon: string
    size?: number
    isActive?: boolean
}

export default function EditorIcon({
    blackIcon,
    whiteIcon,
    size = 20,
    isActive = false,
}: ToolbarIconProps) {

  const { editorTheme } = useMarkdownEditorContext().contentConfig

  return (
    <span   
      style={{
        display: "flex",
        borderRadius: 3,
        outline: isActive ? "1px solid currentColor" : "none",
      }}
    >
      <img   
        src={editorTheme === 'black' ? whiteIcon : blackIcon}
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