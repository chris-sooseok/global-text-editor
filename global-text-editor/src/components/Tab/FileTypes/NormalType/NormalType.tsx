import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import NormalTypeToolbar from "./NormalTypeToolbar"
import { FloatingMenu } from "@tiptap/react/menus"

export default function NormalType() {

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1,2,3,4,5]
          }
        })
      ],
      content: "",

      coreExtensionOptions: {
        // making a single newline instead of two. This prevents copy/paste from
        // tiptap to other text editor having two lines
        clipboardTextSerializer: {
          blockSeparator: '\n'
        }
      },
      editable: true,
      autofocus: "start",
      // checking schema derived from registered extensions
      enableContentCheck: true,
      // checking if initial content provided is not compatible with the schema =
      onContentError(props) {
        console.log(props.error)
      },  
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
      <div style={{ padding: '0 10px 10px 10px', flex: 1, overflowY: "auto" }}>
        <EditorContent editor={editor} className="prose  max-w-none prose-invert [&_.ProseMirror]:outline-none [&_.ProseMirror>p:first-child]:mt-0" />
      </div>
    </div>
  )
}
