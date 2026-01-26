import { useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import ToolbarRenderer from "./ToolbarRenderer"
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
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE

const DEFAULT_DOC = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 } },
    { type: "paragraph" },
  ],
}

function MarkdownEditor({activeFile, tabId}:{ activeFile : FileNode, tabId: string}) {
    
  {/*** Editor Supports ***/}
  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[activeFile.id]?.editorTheme ?? "black")
  const { loadFileConfig } = ThemeManagerStore.getState()
  const { switchActiveTab } = TabManagerStore.getState()

  useEffect(() => {
    void loadFileConfig(activeFile.id)
  }, [activeFile.id])

  /* Editor Setup */
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

  const saveTimerRef = useRef<number | null>(null)

  {/*** Load File Content ***/}
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
          focusEditor()
          return
        } else {
          try {
            const json = JSON.parse(raw)
            editor.commands.setContent(json, { emitUpdate: false })
            focusEditor()
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

  {/*** Update File Content ***/}
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
      <ToolbarRenderer
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
          onFocus={() => switchActiveTab(tabId)}
          style={{ 
            flex: 1,
            display: "flex",
            width: "100%",
            minHeight: "100%"
            }}
        />
      </div>
    </div>
  </>
  )
}

export default MarkdownEditor