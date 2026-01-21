import type { Editor } from "@tiptap/core"

import blackItalicIcon from "assets/NormalTypeIcons/icons8-italic-black-96.png"
import whiteItalicIcon from "assets/NormalTypeIcons/icons8-italic-white-96.png"


function ItalicButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const isActive = editor.isActive("italic")

  return (
    <button
      type="button"
      aria-label="Italic"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleItalic().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      <i>I</i>
    </button>
  )
}

export default ItalicButton
