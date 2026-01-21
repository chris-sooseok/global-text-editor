import type { Editor } from "@tiptap/core"

function SuperSubSriptButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const superActive = editor.isActive("superscript")
  const subActive = editor.isActive("subscript")

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        aria-label="Superscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSuperscript().run()
        }}
        style={{
          background: superActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
        }}
      >
        x<sup>2</sup>
      </button>

      <button
        type="button"
        aria-label="Subscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSubscript().run()
        }}
        style={{
          background: subActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
        }}
      >
        x<sub>2</sub>
      </button>
    </div>
  )
}

export default SuperSubSriptButton
