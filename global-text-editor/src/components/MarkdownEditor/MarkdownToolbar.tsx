import type { Editor } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
// Button List
import HeadingButton from "./MarkdownButtons/HeadingButton"
import ListButton from "./MarkdownButtons/ListButton"
import BackQuoteButton from "./MarkdownButtons/BackQuoteButton"
import BoldButton from "./MarkdownButtons/BoldButton"
import ItalicButton from "./MarkdownButtons/ItalicButton"
import HighlightButton from "./MarkdownButtons/HighlightButton"
import LinkButton from "./MarkdownButtons/LinkButton"
import CodeBlockButton from "./MarkdownButtons/CodeBlockButton"
import CodeButton from "../Buttons/CodeButton"
import SuperscriptButton from "./MarkdownButtons/SuperscriptButton"
import SubscriptButton from "./MarkdownButtons/SubscriptButton"
import TextAlignButton from "../Buttons/TextAlignButton"
import ImageButton from "./MarkdownButtons/ImageButton"
import UndoButton from "../Buttons/UndoButton"
import RedoButton from "./MarkdownButtons/RedoButton"
import ThemeButton from "./MarkdownButtons/ThemeButton"
import ExportButton from "./MarkdownButtons/ExportButton"
import HideShowButton from "./MarkdownButtons/HideShowButton"
import FontSizeButton from "../Buttons/FontSizeButton"
import FontFamilyButton from "../Buttons/FontFamilyButton"
import { useState } from "react"
import UnderlineButton from "./MarkdownButtons/UnderlineButton"
import StrikethroughButton from "./MarkdownButtons/StrikethroughButton"
import MarkdownButton from "./MarkdownButtons/MarkdownButton"

const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

function EditorToolbar({
  fileId,
  editor,
  isMarkdownView,
  toggleMarkdownView,
}: {
  fileId: number
  editor: Editor
  isMarkdownView: boolean
  toggleMarkdownView: () => void
}) {

  const editorTheme = ThemeManagerStore((s) => s.fileConfigByFileId[fileId]?.editorTheme ?? "black")

  const [ toolbarIsVisible, setToolbarIsVisible ] = useState<boolean>(true)

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
        <style>{`
          /* Chrome / Edge / Electron */
          .toolbar-scroll::-webkit-scrollbar {
            height: 0px;
          }
          /* Firefox */
          .files-scroll {
            scrollbar-width: none;
          }
        `}</style>
        <div
          className="toolbar-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            overflowX: "auto", //scrollable
            overflowY: "hidden",
            visibility: toolbarIsVisible ? "visible" : "hidden",
            pointerEvents: toolbarIsVisible ? "auto" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: 14,
              width: "max-content", // forces buttons to overflow
            }}
          >
          {/* TODO
          font style */}
          <BoldButton editor={editor} fileId={fileId} />
          <ItalicButton editor={editor} fileId={fileId}/>
          <UnderlineButton editor={editor} fileId={fileId} />
          <StrikethroughButton editor={editor} fileId={fileId} />
          <ListButton editor={editor} fileId={fileId} />
          <HighlightButton editor={editor} fileId={fileId} />
          <SuperscriptButton editor={editor} fileId={fileId} />
          <SubscriptButton editor={editor} fileId={fileId} />
          <BackQuoteButton editor={editor} fileId={fileId}/>
          <CodeButton editor={editor} fileId={fileId} />
          <CodeBlockButton editor={editor} fileId={fileId} />          
          <LinkButton editor={editor} fileId={fileId} />
          <ImageButton editor={editor} fileId={fileId} />
            
        </div>
      </div>

        {/* Right Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            paddingLeft: "5px",
            flexShrink: 0,
          }}
        >
          <MarkdownButton
            fileId={fileId}
            isMarkdownView={isMarkdownView}
            toggleMarkdownView={toggleMarkdownView}
          />
          <HideShowButton
            fileId={fileId}
            toolbarIsVisible={toolbarIsVisible}
            setToolbarIsVisible={setToolbarIsVisible}
          />
          <ThemeButton fileId={fileId} />
          <ExportButton editor={editor} fileId={fileId} />

        </div>
      </div>
    </div>
  </>)
}

export default EditorToolbar