import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-black-96.png"
import whiteHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-white-96.png"


function HighlightButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const isActive = editor.isActive("highlight")

  return (
    <button
      type="button"
      aria-label="Highlight"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleHighlight().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackHighlightIcon}
        whiteIcon={whiteHighlightIcon}
      />
    </button>
  )
}

export default HighlightButton
