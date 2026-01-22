import { useState } from "react"
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


function NormalToolbarRenderer({
  editor,
}: {
  editor: Editor | null
}) {

  const toolbarBackground = ThemeManagerStore((s) => s.toolbarBackground)

  const [toolbarIsVisible, setToolbarIsVisible] = useState(true)

  if (!editor) return null

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
      background: toolbarBackground,
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
          <FontFamilyButton editor={editor} />
          <FontSizeButton editor={editor} />
          <HeadingButton editor={editor} />
          <ListButton editor={editor} />
          <BackQuoteButton editor={editor} />
          <BoldButton editor={editor} />
          <ItalicButton editor={editor} />
          <HighlightButton editor={editor} />
          <LinkButton editor={editor} />
          <CodeButton editor={editor} />
          <CodeBlockButton editor={editor} />
          <SuperscriptButton editor={editor} />
          <SubscriptButton editor={editor} />
          <TextAlignButton editor={editor} />
          <ImageButton editor={editor} />
          <UndoButton editor={editor} />
          <RedoButton editor={editor} />
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
          <ExportButton editor={editor} />
          <ThemeButton />
          <HideShowButton
            editor={editor}
            toolbarIsVisible={toolbarIsVisible}
            setToolbarIsVisible={setToolbarIsVisible}
          />
        </div>
      </div>
    </div>
  </>)
}

export default NormalToolbarRenderer