import { useState, useRef} from "react"
import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import {DropdownOverlay} from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import blackLeftAlignIcon from "assets/NormalTypeIcons/icons8-align-left-black-96.png"
import whiteLeftAlignIcon from "assets/NormalTypeIcons/icons8-align-left-white-96.png"
import blackRightAlignIcon from "assets/NormalTypeIcons/icons8-align-right-black-96.png"
import whiteRightAlignIcon from "assets/NormalTypeIcons/icons8-align-right-white-96.png"
import blackCenterAlignIcon from "assets/NormalTypeIcons/icons8-align-center-black-96.png"
import whiteCenterAlignIcon from "assets/NormalTypeIcons/icons8-align-center-white-96.png"
import blackJustifyAlignIcon from "assets/NormalTypeIcons/icons8-align-justify-black-96.png"
import whiteJustifyAlignIcon from "assets/NormalTypeIcons/icons8-align-justify-white-96.png"
import TextAlign from "@tiptap/extension-text-align"

function TextAlignButton({
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {

  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      const headingAlign = editor.getAttributes("heading").textAlign as string | null
      const paragraphAlign = editor.getAttributes("paragraph").textAlign as string | null
      const align = headingAlign ?? paragraphAlign ?? "left"
      return {
        isJustify: align === "justify",
        isLeft: align === "left",
        isCenter: align === "center",
        isRight: align === "right",
      }
    },
  })

  const activeAlignIcons = 
    editorState.isJustify
      ? { black: blackJustifyAlignIcon, white: whiteJustifyAlignIcon }
      : editorState.isLeft
        ? { black: blackLeftAlignIcon, white: whiteLeftAlignIcon }
        : editorState.isCenter
          ? { black: blackCenterAlignIcon, white: whiteCenterAlignIcon }
          : editorState.isRight
            ? { black: blackRightAlignIcon, white: whiteRightAlignIcon }
            : { black: blackLeftAlignIcon, white: whiteLeftAlignIcon }

  return (
    <div style={{ 
      position: "relative",
      display: "flex",
      alignItems: "center"
    }}>
      {/* Toolbar Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
      >
        <ToolbarIcon 
          blackIcon={activeAlignIcons.black}
          whiteIcon={activeAlignIcons.white}
          fileId={fileId}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay 
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 })}
      >
        {/* Justify */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("justify").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackJustifyAlignIcon} 
            whiteIcon={whiteJustifyAlignIcon}
            onlyBlackIcon={true}
            isActive={editorState.isJustify}
          />
        </button>
        {/* Left */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("left").run()
          }}
        >
          <ToolbarIcon
            blackIcon={blackLeftAlignIcon} 
            whiteIcon={whiteLeftAlignIcon} 
            onlyBlackIcon={true}
            isActive={editorState.isLeft}
          />
        </button>
        {/* Center */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("center").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackCenterAlignIcon} 
            whiteIcon={whiteCenterAlignIcon}
            onlyBlackIcon={true}
            isActive={editorState.isCenter}
          />
        </button>
        {/* Right */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("right").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackRightAlignIcon} 
            whiteIcon={whiteRightAlignIcon}
            onlyBlackIcon={true}
            isActive={editorState.isRight}
          />
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default TextAlignButton
