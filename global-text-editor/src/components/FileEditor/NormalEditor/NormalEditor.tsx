import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FontSize, FontFamily, TextStyle } from "@tiptap/extension-text-style"
import { ListKit } from "@tiptap/extension-list"
import Highlight from "@tiptap/extension-highlight"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import NormalToolbarRenderer from "./NormalToolbarRenderer"
import { Markdown } from '@tiptap/markdown'

import Link from "@tiptap/extension-link"

export type themeColorType = "black" | "white"

export default function NormalEditor() {
  const [themeColor, setThemeColor] = useState<themeColorType>("black")

  // editor configuration
  const editor = useEditor({
    extensions: [
      FontFamily,
      TextStyle,
      FontSize,
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListKit,
      Highlight,
      SuperScript,
      Subscript,
      TextAlign,
      Image,
      Markdown,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "normal-editor",
        spellcheck: "false"
      }
    },
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
        overflowX: "hidden",
        background: themeColor === "black" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)",
      }}
    >
      <NormalToolbarRenderer
        editor={editor}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
      />

      {/* Editor */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <EditorContent
            editor={editor}
            className={
              (themeColor === "black" ? "prose prose-invert " : "prose ") +
              "max-w-none [&_.ProseMirror>p:first-child]:mt-0"
            }
            style={{ background: "transparent" }}
          />
        </div>
      </div>
    </div>
  </>
  )
}
