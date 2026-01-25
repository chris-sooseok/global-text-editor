import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackBoldIcon from "assets/NormalTypeIcons/icons8-bold-black-96.png"
import whiteBoldIcon from "assets/NormalTypeIcons/icons8-bold-white-96.png"


function BoldButton({ 
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
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBold().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackBoldIcon}
        whiteIcon={whiteBoldIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default BoldButton
