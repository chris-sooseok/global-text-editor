import type { Editor } from "@tiptap/core"

function BoldButton({ editor }: { editor: Editor | null }) {
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
      }}
    >
      <b>B</b>
    </button>
  )
}

export default BoldButton
