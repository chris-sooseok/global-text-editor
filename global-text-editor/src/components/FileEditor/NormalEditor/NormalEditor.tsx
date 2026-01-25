import { useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import NormalToolbarRenderer from "./NormalToolbarRenderer"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"

import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FontSize, FontFamily, TextStyle } from "@tiptap/extension-text-style"
import { ListKit } from "@tiptap/extension-list"
import Highlight from "@tiptap/extension-highlight"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { Markdown } from '@tiptap/markdown'

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE

const DEFAULT_DOC = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 } },
    { type: "paragraph" },
  ],
}

function NormalEditor({activeFile}: {activeFile : FileNode}) {
    /* Editor */
    const editor = useEditor({
      extensions: [
        FontFamily,
        TextStyle,
        FontSize,
        // List Kit already has these extensions
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
      content: "", // initial heading
      editable: true,
      autofocus: "start",
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
      // checking schema derived from registered extensions
      enableContentCheck: true,
      // checking if initial content provided is not compatible with the schema =
      onContentError(props) {
        console.log(props.error)
      }
  })

  if (!editor) return null

  {/* Load File Config */}
  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[activeFile.id]?.editorTheme ?? "black")
  const loadFileConfig = ThemeManagerStore((s) => s.loadFileConfig)

  useEffect(() => {
    void loadFileConfig(activeFile.id)
  }, [activeFile.id, loadFileConfig])

  {/* Save Timer */}
  const saveTimerRef = useRef<number | null>(null)

  {/* Load File Content */}
  useEffect(() => {
    let cancelled = false

    function focusEditor() {
      setTimeout(() => {
        if (!cancelled) editor.commands.focus("start")
      }, 0)
    }

    async function loadFileContent() {
        // load file
        const contentRes = await window.api.loadFileContent(activeFile.storagePath)
        if (cancelled) return

        // TODO: if failed, dont allow editing at all
        if (!contentRes.ok) {
          editor.commands.setContent(DEFAULT_DOC, { emitUpdate: false })
          // focusStartSoon()
          return
        }

        const raw = contentRes.fileContent
        if (!raw) {
          editor.commands.setContent(DEFAULT_DOC, { emitUpdate: false })
          editor.commands.focus("start")
          // focusStartSoon()
          return
        } else {
          try {
            const json = JSON.parse(raw)
            editor.commands.setContent(json, { emitUpdate: false })
            // focusStartSoon()
          } catch {
            // TODO: if corrupted, dont allow editing at all
            editor.commands.setContent(DEFAULT_DOC, { emitUpdate: false })
            // focusStartSoon()
          }
        }
      }
      
    void loadFileContent()  

    return () => {
      cancelled = true
    }
  }, [editor, activeFile.storagePath])

  {/* Update File Content */}
  useEffect(() => {

    function saveNow() {
      const fileContent = JSON.stringify(editor.getJSON())
      void window.api.saveFileContent(activeFile.storagePath, fileContent)
    }

    function onUpdate(){
      // reset timer on every change
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      // set new timer
      saveTimerRef.current = window.setTimeout(() => {
        saveNow()
        saveTimerRef.current = null
      }, 3000)
    }

    editor.on("update", onUpdate)

    return () => {
      editor.off("update", onUpdate)

      // on unmount or file change, flush
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
        saveNow()
      }
    }
  }, [editor, activeFile])

  
  return (
  <>
    {/* Toolbar and Editor Container */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: editorTheme === "black" ? EDITOR_BACKGROUND_BLACK : EDITOR_BACKGROUND_WHITE,
      }}
    >
      <NormalToolbarRenderer
        fileId={activeFile.id}
        editor={editor}
      />

      {/* Editor */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto", 
          overflowX: "auto",
          width: "100%",
        }}
      >
        {/* Allows centering editor always */}
        <div style={{ 
          minWidth: "100%", 
          minHeight: "100%" 
        }}>
          {/* Editor is always 794px width and centered */}
          <div
            style={{
              width: 794,
              margin: "0 auto", // center editor
              minHeight: "100%",
              display: "flex",
            }}
          >
            <EditorContent
              editor={editor}
              className={
                editorTheme === "black"
                  ? "prose prose-invert max-w-none "
                  : "prose max-w-none"
              }
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default NormalEditor