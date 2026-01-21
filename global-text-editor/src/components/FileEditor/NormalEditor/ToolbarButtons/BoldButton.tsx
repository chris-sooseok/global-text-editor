import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
function BoldButton({ 
  editor,
  themeColor
}: { 
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const isActive = editor.isActive("bold")

  return (
    <button
      type="button"
      aria-label="Bold"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBold().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
        // theme color change
        color: themeColor === "black" ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)" ,
      }}
    >
      <b>B</b>
    </button>
  )
}

export default BoldButton
