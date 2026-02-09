import { useEffect, useRef, useState } from "react"
import type { FileNode } from "store/SidebarStore/FsTreeTypes"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"

import { EditorContent } from "@tiptap/react"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ListKit } from "@tiptap/extension-list"
import TextAlign from "@tiptap/extension-text-align"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import Color from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import { Markdown } from '@tiptap/markdown'

import EditorToolbar from "./MarkdownToolbar"
import TextStyleWithMarkdown from "./MarkdownHelper"
import { makeDefaultDocTemplate } from "./MarkdownHelper"
import { broadcastEditorContentUpdated, onEditorContentUpdated } from "./EditorSyncBus"

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE

type MarkdownEditorProps = {
  activeFile: FileNode,
  tabId: string,
}

function MarkdownEditor({activeFile, tabId}: MarkdownEditorProps) {

  const editor = useEditor({
    extensions: [
      // List Kit already has these extensions
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyleWithMarkdown,
      Color,
      Highlight,
      SuperScript,
      Subscript,
      Link.configure({
        openOnClick: true,      // click opens in browser
        autolink: false,
        linkOnPaste: true,
      }),
      Image,
      Markdown,
    ],
    editorProps: {
      attributes: {
        class: 'normal-editor', // applying index.css styles
        spellcheck: "false"
      }
    },
    coreExtensionOptions: {
      // This prevents copy/paste from tiptap to other text editor having two lines
      clipboardTextSerializer: {
        blockSeparator: "\n",
      },
    },
  })

  if (!editor) return

  /** Supports switching active tab and file on focus */
  const { switchActiveTab, switchActiveFile } = TabManagerStore.getState()

  /** Editor Config */
  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[activeFile.id]?.editorTheme ?? "black")
  const { loadFileConfig } = ThemeManagerStore.getState()
  
  useEffect(() => {
    void loadFileConfig(activeFile.id)
  }, [activeFile.id])

  /** Supports Markdown */
  const [isMarkdownView, setIsMarkdownView] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  // currently used for highlight features
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  /** Supports updates for markdown */
  function onMarkdownUpdate(nextMarkdown: string) {
    setMarkdownContent(nextMarkdown)

    try {
      // This updates the Tiptap doc from markdown (will trigger editor "update")
      editor.commands.setContent(nextMarkdown, { contentType: "markdown" })
    } catch {
      // ignore parse errors while typing
    }
  }

  function toggleMarkdownView() {
    setIsMarkdownView((prev) => {
      const next = !prev
      return next
    })
  }

  {/*** Load File Content ***/}
  useEffect(() => {

    function focusEditor() {
      setTimeout(() => {
        editor.commands.focus("start")
      }, 0)
    }

    async function loadFileContent() {
      const res = await window.api.loadFileContent(activeFile.storagePath)

      if (!res.ok) {
        console.error(res.message)
        return
      }

      const raw = res.fileContent
      if (!raw) {
        const defaultContent = makeDefaultDocTemplate(activeFile.name)
        editor.commands.setContent(defaultContent, { emitUpdate: false })
        // set markdown content
        if (isMarkdownView) setMarkdownContent(editor.getMarkdown())
        focusEditor()
        return
      }

      try {
        const json = JSON.parse(raw)
        editor.commands.setContent(json, { emitUpdate: false })
        // set markdown content
        if (isMarkdownView) setMarkdownContent(editor.getMarkdown())
        focusEditor()
      } catch {
        console.error('File content could not be loaded')
        return
      }
    }

    void loadFileContent()

  }, [editor, activeFile, isMarkdownView])

  {/*** Update File Content ***/}
  const saveTimerRef = useRef<number | null>(null)
  const updateTime = 500

  useEffect(() => {

    function saveFileContent() {
      const fileContent = JSON.stringify(editor.getJSON())
      void window.api.saveFileContent(activeFile.id, activeFile.storagePath, fileContent, tabId)
    }

    function onUpdate() {
      const jsonContent = JSON.stringify(editor.getJSON())
      const markdownContent = editor.getMarkdown()

      broadcastEditorContentUpdated({
        fileId: activeFile.id,
        jsonContent,
        markdownContent,
        originTabId: tabId,
      })

      // your existing debounced save (keep as-is)
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        void window.api.saveFileContent(activeFile.id, activeFile.storagePath, jsonContent, tabId)
        saveTimerRef.current = null
      }, updateTime)
    }

    editor.on("update", onUpdate)

    return () => {
      editor.off("update", onUpdate)

      // on unmount or file switch, flush the state
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
        saveFileContent()
      }
    }
  }, [editor, activeFile])

  {/** Local Update Sync */}
  useEffect(() => {
    const unsubscribe = onEditorContentUpdated(({ fileId, jsonContent, markdownContent, originTabId }) => {
      if (fileId !== activeFile.id) return
      if (originTabId === tabId) return

      try {
        editor.commands.setContent(JSON.parse(jsonContent), { emitUpdate: false })
      } catch {}

      if (isMarkdownView) {
        setMarkdownContent(markdownContent)
      }
    })

    return unsubscribe
  }, [editor, activeFile.id, tabId, isMarkdownView])
  
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
      <EditorToolbar
        activeFile={activeFile}
        editor={editor}
        isMarkdownView={isMarkdownView}
        toggleMarkdownView={toggleMarkdownView}
        markdownText={markdownContent}
        onChangeMarkdown={onMarkdownUpdate}
        textareaRef={textareaRef}
      />

      {/* Editor */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          width: "100%",
          display: "flex",
        }}
      >
      {isMarkdownView ? (
        <textarea
          value={markdownContent}
          onChange={(e) => onMarkdownUpdate(e.currentTarget.value)}
          onFocus={() => {
            switchActiveTab(tabId)
            switchActiveFile(tabId, activeFile)
          }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            minHeight: 0,
            boxSizing: "border-box",

            background: "transparent",
            outline: "none",
            resize: "none",
            fontSize: "16px",
            padding: 12,
            fontFamily: "monospace",

            whiteSpace: "pre-wrap",     // ✅ preserves newlines BUT wraps
            overflowWrap: "anywhere",   // ✅ breaks long tokens/URLs
            wordBreak: "break-word",    // ✅ extra safety
          }}
        />
      ) : (
        <EditorContent
          editor={editor}
          className={editorTheme === "black" ? "prose prose-invert max-w-none " : "prose max-w-none"}
          onFocus={() => {
            switchActiveTab(tabId)
            switchActiveFile(tabId, activeFile)
          }}
          style={{ flex: 1, display: "flex", width: "100%", minHeight: "100%" }}
        />
      )}
      </div>
    </div>
  </>
  )
}

export default MarkdownEditor