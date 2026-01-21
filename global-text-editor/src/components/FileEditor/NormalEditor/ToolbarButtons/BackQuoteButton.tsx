import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"

import blackQuoteIcon from "assets/NormalTypeIcons/icons8-quote-black-96.png"
import whiteQuoteIcon from "assets/NormalTypeIcons/icons8-quote-white-96.png"


function BackQuoteButton({
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const isActive = editor.isActive("blockquote")

  return (
    <button
      type="button"
      aria-label="Toggle blockquote"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBlockquote().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackQuoteIcon}
        whiteIcon={whiteQuoteIcon}
      />
    </button>
  )
}

export default BackQuoteButton
