import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSuperscriptIcon from "assets/NormalTypeIcons/superscript-black.png"
import whiteSuperscriptIcon from "assets/NormalTypeIcons/superscript-white.png"

function SuperscriptButton({ 
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
        aria-label="Superscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSuperscript().run()
        }}
      >
        <ToolbarIcon 
          blackIcon={blackSuperscriptIcon}
          whiteIcon={whiteSuperscriptIcon}
          fileId={fileId}
        />
      </button>
  )
}

export default SuperscriptButton
