import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import NormalTypeToolbar from "./NormalTypeToolbar"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"

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

      {/* Editor */}

      <SimpleEditor />

    </div>
  )
}
