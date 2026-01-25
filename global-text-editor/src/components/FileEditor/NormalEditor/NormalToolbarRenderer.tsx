import { useEffect, useState } from "react"
import { type Dispatch, type SetStateAction } from "react"
import type { Editor } from "@tiptap/react"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import type { editorThemeType } from "./NormalEditor"
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

const TOOLBAR_BACKGROUND_BLACK = import.meta.env.VITE_TOOLBAR_BACKGROUND_BLACK
const TOOLBAR_BACKGROUND_WHITE = import.meta.env.VITE_TOOLBAR_BACKGROUND_WHITE

function NormalToolbarRenderer({
  fileId,
  editor,
}: {
  fileId: number
  editor: Editor
}) {

  const editorTheme = ThemeManagerStore((s) => 
    s.fileConfigByFileId[fileId]?.editorTheme ?? "black")
  const toolbarIsVisible = ThemeManagerStore((s) => 
    s.fileConfigByFileId[fileId]?.toolbarIsVisible ?? true) 


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
          <FontSizeButton editor={editor} fileId={fileId} />
          <HeadingButton editor={editor} editorTheme={editorTheme} />
          <ListButton editor={editor} editorTheme={editorTheme} />
          <BackQuoteButton editor={editor} editorTheme={editorTheme} />
          <BoldButton editor={editor} editorTheme={editorTheme} />
          <ItalicButton editor={editor} editorTheme={editorTheme} />
          <HighlightButton editor={editor} editorTheme={editorTheme} />
          <LinkButton editor={editor} editorTheme={editorTheme} />
          <CodeButton editor={editor} editorTheme={editorTheme} />
          <CodeBlockButton editor={editor} editorTheme={editorTheme} />
          <SuperscriptButton editor={editor} editorTheme={editorTheme} />
          <SubscriptButton editor={editor} editorTheme={editorTheme} />
          <TextAlignButton editor={editor} editorTheme={editorTheme} />
          <ImageButton editor={editor} editorTheme={editorTheme} />
          <UndoButton editor={editor} editorTheme={editorTheme} />
          <RedoButton editor={editor} editorTheme={editorTheme} />
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
          <ExportButton editor={editor} editorTheme={editorTheme} />
          <ThemeButton 
            fileId={fileId}
            editorTheme={editorTheme} 
          />
          <HideShowButton
            fileId={fileId}
            editorTheme={editorTheme}
            toolbarIsVisible={toolbarIsVisible}
          />
        </div>
      </div>
    </div>
  </>)
}

export default NormalToolbarRenderer