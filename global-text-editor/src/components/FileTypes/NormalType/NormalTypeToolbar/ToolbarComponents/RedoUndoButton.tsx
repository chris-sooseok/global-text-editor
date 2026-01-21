import type { Editor } from "@tiptap/core"

function RedoUndoButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const canUndo = editor.can().chain().focus().undo().run()
  const canRedo = editor.can().chain().focus().redo().run()

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        aria-label="Undo"
        disabled={!canUndo}
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().undo().run()
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
          opacity: canUndo ? 1 : 0.4,
        }}
      >
        ↶
      </button>

      <button
        type="button"
        aria-label="Redo"
        disabled={!canRedo}
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().redo().run()
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
          opacity: canRedo ? 1 : 0.4,
        }}
      >
        ↷
      </button>
    </div>
  )
}

export default RedoUndoButton
