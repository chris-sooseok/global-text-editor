import type { Editor } from "@tiptap/core"

function HighlightButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const isActive = editor.isActive("highlight")

  return (
    <button
      type="button"
      aria-label="Highlight"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleHighlight().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      HL
    </button>
  )
}

export default HighlightButton
