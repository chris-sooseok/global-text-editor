import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

export default function NormalTypeToolbar(
    {editor} : {editor: Editor | null}
) {

  const [headingChoice, setHeadingChoice] = useState("")

  if (!editor) return null
  
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
      <select
        value=""
        onChange={(e) => {
          const level = Number(e.target.value) as 1 | 2 | 3
          editor.chain().focus().setHeading({ level }).run()
          setHeadingChoice("") // reset so it shows "H" again
        }}
        
        style={{
          cursor: "pointer",
          outline: "none"
        }}
      >
        <option value="" disabled>
          H
        </option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}
      >
        B
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }}
      >
        I
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