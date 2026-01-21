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
        position: "relative", // set center and right buttons

      } 
      }>
      {toolbarIsVisible ? <>
        {/* Center Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            // center dropdown-embeded buttons since
            // they return "relative" element instead of button element
            alignItems: "center", 
            gap: 18,
            flexWrap: "nowrap",
          }}
        >
          {/* TODO
          font style */}
          
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
        </div> </> 
        : null}  

        {/* Right Buttons */}
        <div
          style={{
            display: "flex",
            // position them at the right cornet
            position: "absolute",
            right: 0,
            // center
            top: "50%",
            transform: "translateY(-50%)",
            gap: 8,
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