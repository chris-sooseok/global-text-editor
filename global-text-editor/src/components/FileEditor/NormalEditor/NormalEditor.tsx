import { useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import NormalToolbarRenderer from "./NormalToolbarRenderer"

import normalEditorConfig from "./normalEditorConfig"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"
const SAVE_DELAY_MS = 2000

function NormalEditor({file}: {file : FileNode}) {
  const editor = normalEditorConfig()

  const [editorTheme, setEditorTheme] = useState<"black" | "white">("black")
  const [configLoaded, setConfigLoaded] = useState(false)

  const { editorBackgroundBlack, editorBackgroundWhite } = ThemeManagerStore.getState()
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!editor) return

    let cancelled = false

    ;(async () => {
      const res = await window.api.fetchNormalEditor(file.storagePath)
      if (cancelled) return
      
      if (!res.ok) {
        editor.commands.setContent("", { emitUpdate: false })
        return
      }

      const raw = res.editorData ?? ""
      if (!raw) {
        // IMPORTANT: clear when file has no saved data
        editor.commands.setContent("", { emitUpdate: false })
        return
      }

      try {
        const json = JSON.parse(raw)
        // load without triggering your autosave update
        editor.commands.setContent(json, { emitUpdate: false })
      } catch {
        // ignore bad json
      }
    })()

    return () => {
      cancelled = true
    }
  }, [editor, file.storagePath])


  useEffect(() => {
    let cancelled = false
    setConfigLoaded(false)

    ;(async () => {
      const res = await window.api.loadFileConfig(file.id)
      if (cancelled) return
      if (!res.ok) return

      setConfigLoaded(true)
      setEditorTheme(res.editorTheme) // "black" | "white"
    })()

    return () => {
      cancelled = true
    }
  }, [file.id])


  useEffect(() => {
    if (!editor) return

    const onUpdate = () => {
      // timer already scheduled -> do nothing
      if (saveTimerRef.current) return

      // schedule exactly one save
      saveTimerRef.current = window.setTimeout(() => {
        const json = JSON.stringify(editor.getJSON())
        window.api.saveNormalEditor(file.id, json)

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
  }, [editor, file])

  if (!configLoaded) return null
  
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
        background: editorTheme === "black" ? editorBackgroundBlack : editorBackgroundWhite,
      }}
    >
      <NormalToolbarRenderer
        fileId={file.id}
        editor={editor}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
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