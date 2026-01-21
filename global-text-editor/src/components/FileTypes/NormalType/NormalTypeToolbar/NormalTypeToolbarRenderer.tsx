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

export default function NormalTypeToolbarRenderer({
  editor,
  isLight,
  setIsLight,
}: {
  editor: Editor | null
  isLight: boolean
  setIsLight: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [toolbarIsVisible, setToolbarIsVisible] = useState(true)

  if (!editor) return null

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,

        // ✅ toolbar background switches
        background: isLight ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)",

        // ✅ border visible in both themes
        borderBottom: isLight
          ? "1px solid rgba(0,0,0,0.10)"
          : "1px solid rgba(255,255,255,0.10)",

        padding: "10px",
      }}
    >
      <div style={{ position: "relative" }}>
        {!toolbarIsVisible ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HideShowButton
              editor={editor}
              toolbarIsVisible={toolbarIsVisible}
              setToolbarIsVisible={setToolbarIsVisible}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <HeadingDropdown editor={editor} />
              <ListDropdown editor={editor} isLight={isLight} />
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
              <ThemeColorButton isLight={isLight} setIsLight={setIsLight} />
              <ExportButton editor={editor} />
              <HideShowButton
                editor={editor}
                toolbarIsVisible={toolbarIsVisible}
                setToolbarIsVisible={setToolbarIsVisible}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
