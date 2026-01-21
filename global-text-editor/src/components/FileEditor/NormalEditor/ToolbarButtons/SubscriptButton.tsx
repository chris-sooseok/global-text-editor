import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"

import blackSubscriptIcon from "assets/NormalTypeIcons/subscript-black.png"
import whiteSubscriptIcon from "assets/NormalTypeIcons/subscript-white.png"

function SubscriptButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const isActive = editor.isActive("subscript")

  return (
      <button
        type="button"
        aria-label="Subscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSubscript().run()
        }}
        style={{
          background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
        }}
      >
        <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={blackSubscriptIcon}
          whiteIcon={whiteSubscriptIcon}
        />
      </button>
  )
}

export default SubscriptButton
