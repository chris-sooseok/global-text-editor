import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSubscriptIcon from "assets/NormalTypeIcons/subscript-black.png"
import whiteSubscriptIcon from "assets/NormalTypeIcons/subscript-white.png"

function SubscriptButton({ 
  editor,
  fileId
}: {
  editor: Editor | null
  fileId: number
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
          fileId={fileId}
        />
      </button>
  )
}

export default SubscriptButton
