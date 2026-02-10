import { useEffect, useRef, useState } from "react"
import type { FileNode } from "store/SidebarStore/FsTreeTypes"
import { MarkdownEditorContextProvider, type ContentConfig } from "context/MarkdownEditorContext"
import { TabManagerStore } from "store/TabManagerStore/TabManagerStore"
// Tiptap Configuration
import { useEditor, EditorContent } from "@tiptap/react"
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
import TextStyleWithMarkdown from "./MarkdownHelper"
// Toolbar Buttons
import ListButton from "./MarkdownButtons/ListButton"
import BackQuoteButton from "./MarkdownButtons/BackQuoteButton"
import BoldButton from "./MarkdownButtons/BoldButton"
import ItalicButton from "./MarkdownButtons/ItalicButton"
import HighlightButton from "./MarkdownButtons/HighlightButton"
import LinkButton from "./MarkdownButtons/LinkButton"
import CodeBlockButton from "./MarkdownButtons/CodeBlockButton"
import CodeButton from "./MarkdownButtons/CodeButton"
import SuperscriptButton from "./MarkdownButtons/SuperscriptButton"
import SubscriptButton from "./MarkdownButtons/SubscriptButton"
import ImageButton from "./MarkdownButtons/ImageButton"
import ThemeButton from "./MarkdownButtons/ThemeButton"
import ExportButton from "./MarkdownButtons/ExportButton"
import UnderlineButton from "./MarkdownButtons/UnderlineButton"
import StrikethroughButton from "./MarkdownButtons/StrikethroughButton"
import MarkdownButton from "./MarkdownButtons/MarkdownButton"
import ParagraphButton from "./MarkdownButtons/ParagraphButton"
import TextAlignButton from "./MarkdownButtons/TextAlignButton"
// Sync
import { broadcastEditorContentUpdated, onEditorContentUpdated } from "./EditorSyncBus"

const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE
const EDITOR_BACKGROUND_BLACK = import.meta.env.VITE_EDITOR_BACKGROUND_BLACK
const EDITOR_BACKGROUND_WHITE = import.meta.env.VITE_EDITOR_BACKGROUND_WHITE

function MarkdownEditor({tabId}: {tabId: string} ) {

  const activeFile: FileNode = TabManagerStore((s) => s.activeFileByTabIds)[tabId]

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

  if (!editor) return undefined

  /** Load Content Config */
  const contentConfig: ContentConfig = { editorTheme : "black"}
  useEffect(() => {
    let cancelled = false
    async function loadContentConfig() {
      const res = await window.api.loadContentConfig(activeFile.id)
      if (cancelled) return
      if (res.ok) {
          contentConfig.editorTheme = res.editorTheme
      } 
    }
    void loadContentConfig()
    return () => {
      cancelled = true
    }
  }, [activeFile.id])

  /** Supports Markdown */
  const [isMarkdownView, setIsMarkdownView] = useState(false)
  const markdownContentRef = useRef<string>("")

  /** Markdown Manipulation */
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  function toggleMarkdownView() {
    setIsMarkdownView((prev) => {
      const next = !prev
      if (next) {
        const md = editor.getMarkdown()
        markdownContentRef.current = md
      }
      return next
    })
  }

  {/*** Load Json Content ***/}
  useEffect(() => {
    async function loadJsonContent() {
      const res = await window.api.loadJsonContent(activeFile.storagePath)

      if (!res.ok) {
        console.error(res.message)
        return
      }

      try {
        const json = JSON.parse(res.jsonContent)
        editor.commands.setContent(json, { emitUpdate: false })
        setTimeout(() => {
          editor.commands.focus("start")
        }, 0)
      } catch {
        console.error('File content could not be loaded')
        return
      } 
    }

    void loadJsonContent()

  }, [editor, activeFile.storagePath])

  {/*** Update File Content ***/}
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    function saveJsonContent() {
      const jsonContent = JSON.stringify(editor.getJSON())
      void window.api.saveJsonContent(activeFile.storagePath, jsonContent)
    }

    function onUpdate() {
      const jsonContent = JSON.stringify(editor.getJSON())
      const markdownContent = editor.getMarkdown()

      // On update, broadcast changes to other tabs that may display the same file
      broadcastEditorContentUpdated({
        fileId: activeFile.id,
        jsonContent,
        markdownContent,
        originTabId: tabId,
      })

      // on update, set timeout for saving content
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        void window.api.saveJsonContent(activeFile.storagePath, jsonContent)
        saveTimerRef.current = null
      }, 500)
    }

    editor.on("update", onUpdate)

    return () => {
      editor.off("update", onUpdate)

      // on unmount or file switch, flush the state
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
        saveJsonContent()
      }
    }
  }, [editor, activeFile])

  {/** Local Update Sync data from other tabs * */}
  useEffect(() => {
    const unsubscribe = onEditorContentUpdated(({ fileId, jsonContent, markdownContent, originTabId }) => {
      if (activeFile.id !== fileId) return
      if (tabId === originTabId) return

      try {
        editor.commands.setContent(JSON.parse(jsonContent), { emitUpdate: false })
      } catch {}

      if (isMarkdownView) {
        markdownContentRef.current = markdownContent
        if (textareaRef.current) textareaRef.current.value = markdownContent
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
        background: contentConfig.editorTheme === "black" ? EDITOR_BACKGROUND_BLACK : EDITOR_BACKGROUND_WHITE,
      }}
    >
      <MarkdownEditorContextProvider editor={editor} contentConfig={contentConfig} >
        <div
          style={{
            // keep toolbar at the top and adove editor
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "7px 20px",
            minHeight: 3,
            borderBottom: `1px solid ${contentConfig.editorTheme === "black" ? "#333" : "#ddd"}`,
            // change toolbar theme color and border color
            background: contentConfig.editorTheme === "black" ? TOOLBAR_BACKGROUND_BLACK : TOOLBAR_BACKGROUND_WHITE
          }}
        >
          {/* Button List */}
          <div 
            style={{ 
              display: "flex", // set center and right buttons
              alignItems: "center",
              gap: 12,
            } 
            }>
              
              {/* Left Buttons: Scrollable */}
              <div
                className="toolbar-scroll"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    gap: 16,
                    width: "max-content", // forces buttons to overflow
                  }}
                >
                  {/* TODO
                  font style */}
                  <BoldButton />
                  <ParagraphButton />
                  <ItalicButton />
                  <UnderlineButton />
                  <StrikethroughButton />
                  <ListButton />
                  <TextAlignButton />
                  <HighlightButton
                    isMarkdownView={isMarkdownView}
                    markdownText={markdownContentRef}
                    textareaRef={textareaRef}
                  />
                  <SuperscriptButton />
                  <SubscriptButton />
                  <BackQuoteButton />
                  <CodeButton />
                  <CodeBlockButton />          
                  <LinkButton />
                  <ImageButton storagePath={activeFile.storagePath} />   
                </div>
              </div>
              {/* Right Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  paddingLeft: "5px",
                  flexShrink: 0,
                }}
              >
                <MarkdownButton
                  isMarkdownView={isMarkdownView}
                  toggleMarkdownView={toggleMarkdownView}
                />
                <ThemeButton />
                <ExportButton />
              </div>
          </div>
        </div>
      </MarkdownEditorContextProvider>

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
          readOnly
          defaultValue={markdownContentRef.current}
          onFocus={() => {
            TabManagerStore.getState().switchActiveTab(tabId)
            TabManagerStore.getState().switchActiveFile(tabId, activeFile)
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
          className={contentConfig.editorTheme === "black" ? "prose prose-invert max-w-none " : "prose max-w-none"}
          onFocus={() => {
            TabManagerStore.getState().switchActiveTab(tabId)
            TabManagerStore.getState().switchActiveFile(tabId, activeFile)
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