import { useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
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
const SAVE_DELAY_MS = 2000

export default function NormalEditor(
  fileId: number
) {

  const editorTheme = ThemeManagerStore((s) => s.editorTheme)
  const editorBackground = ThemeManagerStore((s) => s.editorBackground)

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

  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!editor) return

    const scheduleSave = () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)

      saveTimerRef.current = window.setTimeout(() => {
        const json = JSON.stringify(editor.getJSON())
        window.api.saveNormalEditor(json)
      }, SAVE_DELAY_MS)
    }

    editor.on("update", scheduleSave)

    return () => {
      editor.off("update", scheduleSave)
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [editor])

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
        background: editorBackground,
      }}
    >
      <NormalToolbarRenderer
        editor={editor}
      />

      {/* Editor */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <EditorContent
            editor={editor}
            className={
              (editorTheme === "black" ? "prose prose-invert " : "prose ") +
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
