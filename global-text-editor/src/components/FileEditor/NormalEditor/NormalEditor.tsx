import { useEffect, useRef } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import NormalToolbarRenderer from "./NormalToolbarRenderer"

import normalEditorConfig from "./normalEditorConfig"
const SAVE_DELAY_MS = 2000

function NormalEditor({
  fileId
}: {
  fileId: number
}) {
  const editor = normalEditorConfig()
  const editorTheme = ThemeManagerStore((s) => s.editorTheme)
  const editorBackground = ThemeManagerStore((s) => s.editorBackground)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!editor) return

    const onUpdate = () => {
      // timer already scheduled -> do nothing
      if (saveTimerRef.current) return

      // schedule exactly one save
      saveTimerRef.current = window.setTimeout(() => {
        const json = JSON.stringify(editor.getJSON())
        window.api.saveNormalEditor(fileId, json)

        // allow next change to schedule again
        saveTimerRef.current = null
      }, SAVE_DELAY_MS)
    }

    editor.on("update", onUpdate)

    return () => {
      editor.off("update", onUpdate)
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [editor, fileId])

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

export default NormalEditor