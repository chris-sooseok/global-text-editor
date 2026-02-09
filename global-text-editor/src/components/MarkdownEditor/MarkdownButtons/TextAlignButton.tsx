import { useState, useRef} from "react"
import type { Editor } from "@tiptap/core"
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


function TextAlignButton({
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {

  if (!editor) return null

  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})

  const activeAlignIcons =
  editor.isActive({ textAlign: "center" })
    ? { black: blackCenterAlignIcon, white: whiteCenterAlignIcon }
    : editor.isActive({ textAlign: "right" })
      ? { black: blackRightAlignIcon, white: whiteRightAlignIcon }
      : editor.isActive({ textAlign: "justify" })
        ? { black: blackJustifyAlignIcon, white: whiteJustifyAlignIcon }
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
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        {/* Justify */}
        <button
          data-active-key="justify"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("justify").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackJustifyAlignIcon} 
            whiteIcon={whiteJustifyAlignIcon}
            onlyBlackIcon={true}
          />
        </button>
        {/* Left */}
        <button
          data-active-key="left"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("left").run()
          }}
        >
          <ToolbarIcon
            blackIcon={blackLeftAlignIcon} 
            whiteIcon={whiteLeftAlignIcon} 
            onlyBlackIcon={true}
          />
        </button>
        {/* Center */}
        <button
          data-active-key="center"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("center").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackCenterAlignIcon} 
            whiteIcon={whiteCenterAlignIcon}
            onlyBlackIcon={true}
          />
        </button>
        {/* Right */}
        <button
          data-active-key="right"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("right").run()
          }}
        >
          <ToolbarIcon 
            blackIcon={blackRightAlignIcon} 
            whiteIcon={whiteRightAlignIcon}
            onlyBlackIcon={true}
          />
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default TextAlignButton
