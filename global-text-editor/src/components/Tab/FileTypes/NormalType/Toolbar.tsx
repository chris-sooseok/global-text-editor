
import { Editor } from "@tiptap/react"

export default function NormalTypeToolbar(
    {editor} : {editor: Editor | null}
) {


  if (!editor) { return null}

  return (
  <>
  {/* Toolbar */}
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        gap: 8,
        padding: "10px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }}
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        // toggleHeading({ level }) switches between paragraph and that heading level
        style={{ fontWeight: editor.isActive('heading', { level: 1 }) ? 'bold' : 'normal' }}
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{ fontWeight: editor.isActive('bulletList') ? 'bold' : 'normal' }}
      >
        • List
      </button>
    </div>
  </>
  )
}