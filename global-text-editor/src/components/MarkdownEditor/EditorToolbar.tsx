import type { Editor } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
// Button List
import HeadingButton from "./ToolbarButtons/HeadingButton"
import ListButton from "./ToolbarButtons/ListButton"
import BackQuoteButton from "./ToolbarButtons/BackQuoteButton"
import BoldButton from "./ToolbarButtons/BoldButton"
import ItalicButton from "./ToolbarButtons/ItalicButton"
import HighlightButton from "./ToolbarButtons/HighlightButton"
import LinkButton from "./ToolbarButtons/LinkButton"
import CodeBlockButton from "./ToolbarButtons/CodeBlockButton"
import CodeButton from "./ToolbarButtons/CodeButton"
import SuperscriptButton from "./ToolbarButtons/SuperscriptButton"
import SubscriptButton from "./ToolbarButtons/SubscriptButton"
import TextAlignButton from "./ToolbarButtons/TextAlignButton"
import ImageButton from "./ToolbarButtons/ImageButton"
import UndoButton from "./ToolbarButtons/UndoButton"
import RedoButton from "./ToolbarButtons/RedoButton"
import ThemeButton from "./ToolbarButtons/ThemeButton"
import ExportButton from "./ToolbarButtons/ExportButton"
import HideShowButton from "./ToolbarButtons/HideShowButton"
import FontSizeButton from "./ToolbarButtons/FontSizeButton"
import FontFamilyButton from "./ToolbarButtons/FontFamilyButton"
import { useState } from "react"

const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

function EditorToolbar({fileId, editor}: {fileId: number, editor: Editor}) {

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
      padding: "5px 15px",
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
          <FontFamilyButton editor={editor} fileId={fileId} />
          <FontSizeButton editor={editor} editorTheme={editorTheme} />
          <HeadingButton editor={editor} fileId={fileId} />
          <ListButton editor={editor} fileId={fileId} />
          <BackQuoteButton editor={editor} fileId={fileId}/>
          <BoldButton editor={editor} fileId={fileId} />
          <ItalicButton editor={editor} fileId={fileId}/>
          <HighlightButton editor={editor} fileId={fileId} />
          <LinkButton editor={editor} fileId={fileId} />
          <CodeButton editor={editor} fileId={fileId} />
          <CodeBlockButton editor={editor} fileId={fileId} />
          <SuperscriptButton editor={editor} fileId={fileId} />
          <SubscriptButton editor={editor} fileId={fileId} />
          <TextAlignButton editor={editor} fileId={fileId} />
          <ImageButton editor={editor} fileId={fileId} />
          <UndoButton editor={editor} fileId={fileId} />
          <RedoButton editor={editor} fileId={fileId}/>
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