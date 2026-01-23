import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSuperscriptIcon from "assets/NormalTypeIcons/superscript-black.png"
import whiteSuperscriptIcon from "assets/NormalTypeIcons/superscript-white.png"

function SuperscriptButton({ 
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
        aria-label="Superscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSuperscript().run()
        }}
      >
        <ToolbarIcon 
          blackIcon={blackSuperscriptIcon}
          whiteIcon={whiteSuperscriptIcon}
          editorTheme={editorTheme}
        />
      </button>
  )
}

export default SuperscriptButton
