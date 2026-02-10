import type { Editor } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
// Button List
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
import type { FileNode } from "store/SidebarStore/FsTreeTypes"
import ParagraphButton from "./MarkdownButtons/ParagraphButton"
import TextAlignButton from "./MarkdownButtons/TextAlignButton"

const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

function EditorToolbar({
  activeFile,
  editor,
  isMarkdownView,
  toggleMarkdownView,
  markdownText,
  textareaRef,
}: {
  activeFile: FileNode
  editor: Editor
  isMarkdownView: boolean
  toggleMarkdownView: () => void
  markdownText: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {

  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[activeFile.id]?.editorTheme ?? "black")

  return (<>
  {/* Toolbar Container */}
  <div
    style={{
      // keep toolbar at the top and adove editor
      position: "sticky",
      top: 0,
      zIndex: 10,
      padding: "5px 20px",
      minHeight: 30,
      borderBottom: `1px solid ${editorTheme === "black" ? "#333" : "#ddd"}`,
      // change toolbar theme color and border color
      background: editorTheme === "black" ? TOOLBAR_BACKGROUND_BLACK : TOOLBAR_BACKGROUND_WHITE
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
        {/* Left Buttons */}
        <div
          className="toolbar-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: 14,
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
          <BoldButton editor={editor} fileId={activeFile.id} />
          <ParagraphButton editor={editor} fileId={activeFile.id} />
          <ItalicButton editor={editor} fileId={activeFile.id}/>
          <UnderlineButton editor={editor} fileId={activeFile.id} />
          <StrikethroughButton editor={editor} fileId={activeFile.id} />
          <ListButton editor={editor} fileId={activeFile.id} />
          <TextAlignButton editor={editor} fileId={activeFile.id} />
          <HighlightButton
            editor={editor}
            fileId={activeFile.id}
            isMarkdownView={isMarkdownView}
            markdownText={markdownText}
            textareaRef={textareaRef}
          />
          <SuperscriptButton editor={editor} fileId={activeFile.id} />
          <SubscriptButton editor={editor} fileId={activeFile.id} />
          <BackQuoteButton editor={editor} fileId={activeFile.id}/>
          <CodeButton editor={editor} fileId={activeFile.id} />
          <CodeBlockButton editor={editor} fileId={activeFile.id} />          
          <LinkButton editor={editor} fileId={activeFile.id} />
          <ImageButton
            editor={editor}
            fileId={activeFile.id}
            storagePath={activeFile.storagePath}
          />
            
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
            fileId={activeFile.id}
            isMarkdownView={isMarkdownView}
            toggleMarkdownView={toggleMarkdownView}
          />
          <ThemeButton fileId={activeFile.id} />
          <ExportButton editor={editor} fileId={activeFile.id} />

        </div>
      </div>
    </div>
  </>)
}

export default EditorToolbar