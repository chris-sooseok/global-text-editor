import { useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import EditorToolbar from "./MarkdownToolbar"
import type { FileNode } from "store/FsTreeStore/FsTreeTypes"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ListKit } from "@tiptap/extension-list"
import Highlight from "@tiptap/extension-highlight"
import SuperScript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { Markdown } from '@tiptap/markdown'
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
import { 
  broadcastEditorContentUpdated, 
  onEditorContentUpdated,
} from "store/EditorContentStore/EditorSyncBus"

const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE

const DEFAULT_DOC_TEMPLATE = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 } },
    { type: "paragraph" },
  ],
}


function MarkdownEditor({activeFile, tabId}:{ activeFile : FileNode, tabId: string}) {

  const [isMarkdownView, setIsMarkdownView] = useState(false)
  const [markdownText, setMarkdownText] = useState("")
    
  {/*** Editor Config and Supports ***/}
  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[activeFile.id]?.editorTheme ?? "black")
  const { loadFileConfig } = ThemeManagerStore.getState()
  const { switchActiveTab } = TabManagerStore.getState()
  useEffect(() => {
    void loadFileConfig(activeFile.id)
  }, [activeFile.id])

  /* Editor Setup */
    const editor = useEditor({
      extensions: [
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

  function onChangeMarkdown(next: string) {
    setMarkdownText(next)
    if (!editor) return

    try {
      // This updates the Tiptap doc from markdown (will trigger editor "update")
      editor.commands.setContent(next, { contentType: "markdown" })
    } catch {
      // ignore parse errors while typing
    }
  }

  function toggleMarkdownView() {
    if (!editor) return

    setIsMarkdownView((prev) => {
      const next = !prev
      if (next) setMarkdownText(editor.getMarkdown())
      return next
    })
  }

  {/*** Load File Content ***/}
  useEffect(() => {
    if (!editor) return

    let cancelled = false

    // optional: prevent showing old content while loading
    if (isMarkdownView) setMarkdownText("")

    function focusEditor() {
      setTimeout(() => {
        if (!cancelled) editor.commands.focus("start")
      }, 0)
    }

    async function loadFileContent() {
      const contentRes = await window.api.loadFileContent(activeFile.storagePath)
      if (cancelled) return

      if (!contentRes.ok) {
        editor.commands.setContent(DEFAULT_DOC_TEMPLATE, { emitUpdate: false })
        if (isMarkdownView) setMarkdownText(editor.getMarkdown())
        return
      }

      const raw = contentRes.fileContent
      if (!raw) {
        editor.commands.setContent(DEFAULT_DOC_TEMPLATE, { emitUpdate: false })
        if (isMarkdownView) setMarkdownText(editor.getMarkdown())
        focusEditor()
        return
      }

      try {
        const json = JSON.parse(raw)
        editor.commands.setContent(json, { emitUpdate: false })

        if (isMarkdownView) {
          setTimeout(() => {
            if (!cancelled) setMarkdownText(editor.getMarkdown())
          }, 0)
        }

        focusEditor()
      } catch {
        editor.commands.setContent(DEFAULT_DOC_TEMPLATE, { emitUpdate: false })
        if (isMarkdownView) setMarkdownText(editor.getMarkdown())
      }
    }

    void loadFileContent()
    return () => {
      cancelled = true
    }
  }, [editor, activeFile.storagePath, isMarkdownView])

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
    if (!editor) return

    const unsubscribe = onEditorContentUpdated(({ fileId, jsonContent, markdownContent, originTabId }) => {
      if (fileId !== activeFile.id) return
      if (originTabId === tabId) return

      try {
        editor.commands.setContent(JSON.parse(jsonContent), { emitUpdate: false })
      } catch {}

      if (isMarkdownView) {
        setMarkdownText(markdownContent)
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
        fileId={activeFile.id}
        editor={editor}
        isMarkdownView={isMarkdownView}
        toggleMarkdownView={toggleMarkdownView}
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
      {isMarkdownView ? (
        <textarea
          value={markdownText}
          onChange={(e) => onChangeMarkdown(e.currentTarget.value)}
          onFocus={() => switchActiveTab(tabId)}
          style={{
            flex: 1,
            width: "100%",
            minHeight: "100%",
            background: "transparent",
            outline: "none",
            resize: "none",
            fontSize: "16px",
            padding: 12,
            fontFamily: "monospace",
            whiteSpace: "pre",
          }}
        />
      ) : (
        <EditorContent
          editor={editor}
          className={editorTheme === "black" ? "prose prose-invert max-w-none " : "prose max-w-none"}
          onFocus={() => switchActiveTab(tabId)}
          style={{ flex: 1, display: "flex", width: "100%", minHeight: "100%" }}
        />
      )}
      </div>
    </div>
  </>
  )
}

export default MarkdownEditor