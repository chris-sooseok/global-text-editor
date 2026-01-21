import { useState } from "react"
import type { Editor } from "@tiptap/react"
import HeadingDropdown from "./ToolbarComponents/HeadingDropdown"
import ListDropdown from "./ToolbarComponents/ListDropdown"
import BackQuoteButton from "./ToolbarComponents/BackQuoteButton"
import BoldButton from "./ToolbarComponents/BoldButton"
import ItalicButton from "./ToolbarComponents/ItalicButton"
import HighlightButton from "./ToolbarComponents/HighlightButton"
import LinkButton from "./ToolbarComponents/LinkButton"
import CodeBlockButton from "./ToolbarComponents/CodeBlockButton"
import CodeButton from "./ToolbarComponents/CodeButton"
import SuperSubSriptButton from "./ToolbarComponents/SuperSubSriptButton"
import AlignDropdown from "./ToolbarComponents/AlignDropdown"
import ImageButton from "./ToolbarComponents/ImageButton"
import RedoUndoButton from "./ToolbarComponents/RedoUndoButton"
import ThemeColorButton from "./ToolbarComponents/ThemeColorButton"
import ExportButton from "./ToolbarComponents/ExportButton"
import HideShowButton from "./ToolbarComponents/HideShowButton"

import type { themeColorType } from "./NormalEditor"

export default function NormalToolbarRenderer({
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


  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,

        background: themeColor === "black" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)",
        borderBottom:
          themeColor === "black"
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(0,0,0,0.10)",

        padding: "10px 15px",
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Center group only when visible */}
        {toolbarIsVisible ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <HeadingDropdown editor={editor} />
            <ListDropdown editor={editor} themeColor={themeColor} />
            <BackQuoteButton editor={editor} />
            <BoldButton editor={editor} />
            <ItalicButton editor={editor} />
            <HighlightButton editor={editor} />
            <LinkButton editor={editor} />
            <CodeButton editor={editor} />
            <CodeBlockButton editor={editor} />
            <SuperSubSriptButton editor={editor} />
            <AlignDropdown editor={editor} />
            <ImageButton editor={editor} />
            <RedoUndoButton editor={editor} />
          </div>
        ) : null}

        {/* Right group always in the same place */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          <ThemeColorButton themeColor={themeColor} setThemeColor={setThemeColor} />
          {toolbarIsVisible ? <ExportButton editor={editor} /> : null}
          <HideShowButton
            editor={editor}
            toolbarIsVisible={toolbarIsVisible}
            setToolbarIsVisible={setToolbarIsVisible}
          />
        </div>
      </div>
    </div>
  )
}
