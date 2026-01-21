import type { Editor } from "@tiptap/core"

import blackAddImageIcon from "assets/NormalTypeIcons/icons8-add-image-black-96.png"
import whiteAddImageIcon from "assets/NormalTypeIcons/icons8-add-image-white-96.png"


function ImageButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <button
      type="button"
      aria-label="Insert image"
      onMouseDown={(e) => {
        e.preventDefault()

        const src = window.prompt("Image URL")
        if (!src) return

        editor.chain().focus().setImage({ src: src.trim() }).run()
      }}
      style={{
        background: "rgba(255,255,255,0.05)",
      }}
    >
      🖼️
    </button>
  )
}

export default ImageButton
