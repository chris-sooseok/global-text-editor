import { useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import NormalToolbarRenderer from "./NormalToolbarRenderer"

import normalEditorConfig from "./normalEditorConfig"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE


export type editorThemeType = "black" | "white" | null
export type toolbarIsVisible = boolean | null

function NormalEditor({file}: {file : FileNode}) {
  const editor = normalEditorConfig()
  if (!editor) return null

  {/* Load File Config */}
  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[file.id]?.editorTheme ?? "black")
  const loadFileConfig = ThemeManagerStore((s) => s.loadFileConfig)
  useEffect(() => {
    void loadFileConfig(file.id)
  }, [file.id, loadFileConfig])

  {/* Save Timer */}
  const saveTimerRef = useRef<number | null>(null)

  {/* Load File Content */}
  useEffect(() => {
    let cancelled = false
    async function loadFileContent() {
        // load file
        const contentRes = await window.api.loadFileContent(file.storagePath)
        if (cancelled) return

        // TODO: if failed, dont allow editing at all
        if (!contentRes.ok) {
          editor.commands.setContent("", { emitUpdate: false })
          return
        }

        const raw = contentRes.fileContent
        if (!raw) {
          editor.commands.setContent("", { emitUpdate: false })
        } else {
          try {
            const json = JSON.parse(raw)
            editor.commands.setContent(json, { emitUpdate: false })
          } catch {
            // TODO: if corrupted, dont allow editing at all
            editor.commands.setContent("", { emitUpdate: false })
          }
        }
      }
    void loadFileContent()  

    return () => {
      cancelled = true
    }
  }, [editor, file.storagePath])

  {/* Update File Content */}
  useEffect(() => {
    const onUpdate = () => {
      // timer already scheduled -> do nothing
      if (saveTimerRef.current) return

      // schedule exactly one save
      saveTimerRef.current = window.setTimeout(() => {
        const fileContent = JSON.stringify(editor.getJSON())
        window.api.saveFileContent(file.storagePath, fileContent)

        // allow next change to schedule again
        saveTimerRef.current = null
      }, 3000)
    }

    editor.on("update", onUpdate)

    return () => {
      editor.off("update", onUpdate)
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [editor, file])

  
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
        background: editorTheme === "black" ? EDITOR_BACKGROUND_BLACK : EDITOR_BACKGROUND_WHITE,
      }}
    >
      <NormalToolbarRenderer
        fileId={file.id}
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