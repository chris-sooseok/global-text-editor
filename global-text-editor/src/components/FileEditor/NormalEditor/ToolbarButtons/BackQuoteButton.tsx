import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "shared/ToolbarIcon"

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

  return (
    <button
      type="button"
      aria-label="Toggle blockquote"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBlockquote().run()
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
