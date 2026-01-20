import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import NormalTypeToolbar from "./Toolbar"


export default function NormalType() {

    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p>Hello TipTap</p>",
    })


  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "black"
      }}
    >
      {/* Toolbar */}
      <NormalTypeToolbar editor={editor}/>

      {/* Editor */}
      <div style={{ padding: '10px', flex: 1, overflowY: "auto" }}>
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  )
}
