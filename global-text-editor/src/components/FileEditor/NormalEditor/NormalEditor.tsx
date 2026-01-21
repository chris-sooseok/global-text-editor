import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ListKit } from "@tiptap/extension-list"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import NormalToolbarRenderer from "./NormalToolbarRenderer"

export type themeColorType = "black" | "white"

export default function NormalEditor() {
  const [themeColor, setThemeColor] = useState<themeColorType>("black")

  // editor configuration
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
  <>
    {/* Toolbar and Editor Container */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden", // ! will have to change for multiple tabs
        background: themeColor === "black" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)",
      }}
    >
      <NormalToolbarRenderer
        editor={editor}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
      />

      <EditorContent
        editor={editor}
        // ✅ typography colors switch (dark mode uses prose-invert)
        className={
          (themeColor === "black" ? "prose prose-invert " : "prose ") +
          "max-w-none [&_.ProseMirror>p:first-child]:mt-0"
        }
        // ✅ ensure the editable surface inherits the background
        style={{
          background: "transparent",
        }}
      />
    </div>
  </>
  )
}
