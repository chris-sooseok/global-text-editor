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

  return (
      <button
        type="button"
        aria-label="Subscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSubscript().run()
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
