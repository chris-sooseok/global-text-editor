import type { Editor } from "@tiptap/core"

function BackQuoteButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const isActive = editor.isActive("blockquote")

  return (
    <button
      type="button"
      aria-label="Toggle blockquote"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBlockquote().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      <span aria-hidden="true">❝</span>
    </button>
  )
}

export default BackQuoteButton
