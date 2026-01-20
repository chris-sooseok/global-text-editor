import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export default function FileContent() {

    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p>Hello TipTap</p>",
    })


  return (
    <div>
      <div style={{ 
        display: 'flex',
        gap: 8,
        padding: "10px",
      }}>
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

    <div style={{ padding: '10px' }}>
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
    </div>
  )
}
