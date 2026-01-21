import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"

import blackSuperscriptIcon from "assets/NormalTypeIcons/superscript-black.png"
import whiteSuperscriptIcon from "assets/NormalTypeIcons/superscript-white.png"

function SuperscriptButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const isActive = editor.isActive("superscript")

  return (
      <button
        type="button"
        aria-label="Superscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSuperscript().run()
        }}
        style={{
          background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
        }}
      >
        <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={blackSuperscriptIcon}
          whiteIcon={whiteSuperscriptIcon}
        />
      </button>
  )
}

export default SuperscriptButton
