import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "shared/ToolbarIcon"
import blackUndoIcon from "assets/NormalTypeIcons/icons8-undo-black-96.png"
import whiteUndoIcon from "assets/NormalTypeIcons/icons8-undo-white-96.png"


function UndoButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const canUndo = editor.can().chain().focus().undo().run()

  return (
    <button
    type="button"
    aria-label="Undo"
    disabled={!canUndo}
    onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().undo().run()
    }}
    style={{
        opacity: canUndo ? 1 : 0.4,
    }}
    >
    <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackUndoIcon}
        whiteIcon={whiteUndoIcon}
    />
    </button>
  )
}

export default UndoButton
