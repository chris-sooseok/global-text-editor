import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackRedoIcon from "assets/NormalTypeIcons/icons8-redo-black-96.png"
import whiteRedoIcon from "assets/NormalTypeIcons/icons8-redo-white-96.png"

function RedoButton({ 
  editor,
  fileId
}: {
  editor: Editor | null
  fileId: number
}) {
  if (!editor) return null

  const canRedo = editor.can().chain().focus().redo().run()

  return (
    <button
    type="button"
    disabled={!canRedo}
    onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().redo().run()
    }}
    style={{
        opacity: canRedo ? 1 : 0.4,
    }}
    >
    <ToolbarIcon 
        blackIcon={blackRedoIcon}
        whiteIcon={whiteRedoIcon}
        fileId={fileId}
    />
    </button>
  )
}

export default RedoButton
