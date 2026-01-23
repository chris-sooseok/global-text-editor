import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSubscriptIcon from "assets/NormalTypeIcons/subscript-black.png"
import whiteSubscriptIcon from "assets/NormalTypeIcons/subscript-white.png"

function SubscriptButton({ 
  editor,
  editorTheme
}: {
  editor: Editor | null
  editorTheme: "black" | "white"
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
          blackIcon={blackSubscriptIcon}
          whiteIcon={whiteSubscriptIcon}
          editorTheme={editorTheme}
        />
      </button>
  )
}

export default SubscriptButton
