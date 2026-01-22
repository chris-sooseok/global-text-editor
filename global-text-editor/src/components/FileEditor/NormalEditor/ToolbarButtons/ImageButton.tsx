import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "shared/ToolbarIcon"
import blackImageIcon from "assets/NormalTypeIcons/icons8-add-image-black-96.png"
import whiteImageIcon from "assets/NormalTypeIcons/icons8-add-image-white-96.png"


function ImageButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
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
        themeColor={themeColor} 
        blackIcon={blackImageIcon}
        whiteIcon={whiteImageIcon}
      />
    </button>
  )
}

export default ImageButton
