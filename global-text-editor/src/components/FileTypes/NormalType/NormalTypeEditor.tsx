import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import NormalTypeToolbarRenderer from "./NormalTypeToolbar/NormalTypeToolbarRenderer"

import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Link from "@tiptap/extension-link"
import { ListKit } from "@tiptap/extension-list"
import TextAlign from "@tiptap/extension-text-align"

export default function NormalTypeEditor() {
  const [isLight, setIsLight] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListKit,
      Highlight,
      Link,
      SuperScript,
      Subscript,
      TextAlign,
      Image,
    ],
    content: "",

    coreExtensionOptions: {
      // making a single newline instead of two. This prevents copy/paste from
      // tiptap to other text editor having two lines
      clipboardTextSerializer: {
        blockSeparator: "\n",
      },
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
      }}
    >
      {/* Editor */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "0 10px 10px 10px",

          // ✅ editor area background switches too
          background: isLight ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)",
        }}
      >
        <NormalTypeToolbarRenderer
          editor={editor}
          isLight={isLight}
          setIsLight={setIsLight}
        />

        <EditorContent
          editor={editor}
          // ✅ typography colors switch (dark mode uses prose-invert)
          className={
            (isLight ? "prose " : "prose prose-invert ") +
            "max-w-none [&_.ProseMirror>p:first-child]:mt-0"
          }
          // ✅ ensure the editable surface inherits the background
          style={{
            background: "transparent",
            minHeight: "100%",
          }}
        />
      </div>
    </div>
  )
}
