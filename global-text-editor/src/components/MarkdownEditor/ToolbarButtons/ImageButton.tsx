import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackImageIcon from "assets/NormalTypeIcons/icons8-add-image-black-96.png"
import whiteImageIcon from "assets/NormalTypeIcons/icons8-add-image-white-96.png"


function ImageButton({ 
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
        const src = window.prompt("Image URL")
        if (!src) return
        editor.chain().focus().setImage({ src: src.trim() }).run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackImageIcon}
        whiteIcon={whiteImageIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default ImageButton
