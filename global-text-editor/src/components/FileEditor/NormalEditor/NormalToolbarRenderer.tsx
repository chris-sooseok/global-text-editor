import { useState } from "react"
import type { Editor } from "@tiptap/react"
import type { themeColorType } from "./NormalEditor"
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
import ThemeColorButton from "./ToolbarButtons/ThemeColorButton"
import ExportButton from "./ToolbarButtons/ExportButton"
import HideShowButton from "./ToolbarButtons/HideShowButton"
import FontSizeButton from "./ToolbarButtons/FontSizeButton"
import FontFamilyButton from "./ToolbarButtons/FontFamilyButton"

function NormalToolbarRenderer({
  editor,
  themeColor,
  setThemeColor,
}: {
  editor: Editor | null
  themeColor: themeColorType
  setThemeColor: React.Dispatch<React.SetStateAction<themeColorType>>
}) {
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
      padding: "10px 15px",
      // change toolbar theme color and border color
      background: themeColor === "black" 
        ? "rgba(0,0,0,1)" 
        : "rgba(255,255,255,1)",
      borderBottom: themeColor === "black"
        ? "2px solid rgba(255,255,255,0.10)"
        : "2px solid rgba(0,0,0,0.10)",
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
      {toolbarIsVisible ? <>
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
          <FontFamilyButton editor={editor} themeColor={themeColor} />
          <FontSizeButton editor={editor} themeColor={themeColor} />
          <HeadingButton editor={editor} themeColor={themeColor} />
          <ListButton editor={editor} themeColor={themeColor} />
          <BackQuoteButton editor={editor} themeColor={themeColor} />
          <BoldButton editor={editor} themeColor={themeColor} />
          <ItalicButton editor={editor} themeColor={themeColor} />
          <HighlightButton editor={editor} themeColor={themeColor} />
          <LinkButton editor={editor} themeColor={themeColor}/>
          <CodeButton editor={editor} themeColor={themeColor} />
          <CodeBlockButton editor={editor} themeColor={themeColor} />
          <SuperscriptButton editor={editor} themeColor={themeColor}/>
          <SubscriptButton editor={editor} themeColor={themeColor}/>
          <TextAlignButton editor={editor} themeColor={themeColor}/>
          <ImageButton editor={editor} themeColor={themeColor} />
          <UndoButton editor={editor} themeColor={themeColor}/>
          <RedoButton editor={editor} themeColor={themeColor}/>
        </div></div> </> 
        : <div style={{ flex: 1, minWidth: 0 }} />}  

        {/* Right Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            paddingLeft: "5px",
            flexShrink: 0,
          }}
        >
          <ExportButton 
            themeColor={themeColor}
            editor={editor} 
          />
          <ThemeColorButton 
            themeColor={themeColor} 
            setThemeColor={setThemeColor} 
          />
          <HideShowButton
            editor={editor}
            themeColor={themeColor}
            toolbarIsVisible={toolbarIsVisible}
            setToolbarIsVisible={setToolbarIsVisible}
          />
        </div>
      </div>
    </div>
  </>)
}

export default NormalToolbarRenderer