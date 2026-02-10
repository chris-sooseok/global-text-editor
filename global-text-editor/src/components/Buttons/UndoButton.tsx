import type { Editor } from "@tiptap/core"
import Icon from "shared/Icon"
import blackUndoIcon from "assets/NormalTypeIcons/icons8-undo-black-96.png"
import whiteUndoIcon from "assets/NormalTypeIcons/icons8-undo-white-96.png"


function UndoButton({ 
  editor,
  fileId
}: {
  editor: Editor | null
  fileId: number
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
    <Icon 
        blackIcon={blackUndoIcon}
        whiteIcon={whiteUndoIcon}
        fileId={fileId}
    />
    </button>
  )
}

export default UndoButton
