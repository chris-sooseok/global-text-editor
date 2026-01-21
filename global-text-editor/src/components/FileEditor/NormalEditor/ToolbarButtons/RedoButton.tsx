import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackRedoIcon from "assets/NormalTypeIcons/icons8-redo-black-96.png"
import whiteRedoIcon from "assets/NormalTypeIcons/icons8-redo-white-96.png"

function RedoButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const canRedo = editor.can().chain().focus().redo().run()

  return (
    <button
    type="button"
    aria-label="Redo"
    disabled={!canRedo}
    onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().redo().run()
    }}
    style={{
        background: "rgba(255,255,255,0.05)",
        opacity: canRedo ? 1 : 0.4,
    }}
    >
    <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackRedoIcon}
        whiteIcon={whiteRedoIcon}
    />
    </button>
  )
}

export default RedoButton
