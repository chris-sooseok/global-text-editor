import { useState, useRef} from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import type { themeColorType } from "../NormalEditor"
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
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
    if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

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
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen(dropdownIsOpen ? false : true)
        }}
      >
        <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={activeAlignIcons.black}
          whiteIcon={activeAlignIcons.white}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay 
        dropdownIsOpen={dropdownIsOpen} 
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        themeColor={themeColor}
        activeCheck={(key) => editor.isActive({ textAlign: key })}
      >
        {/* Justify */}
        <button
          data-active-key="justify"
          onMouseDown={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <ToolbarIcon 
            themeColor={themeColor} 
            blackIcon={blackJustifyAlignIcon} 
            whiteIcon={whiteJustifyAlignIcon} 
          />
        </button>
        {/* Left */}
        <button
          data-active-key="left"
          onMouseDown={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <ToolbarIcon 
            themeColor={themeColor} 
            blackIcon={blackLeftAlignIcon} 
            whiteIcon={whiteLeftAlignIcon} 
          />
        </button>
        {/* Center */}
        <button
          data-active-key="center"
          onMouseDown={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <ToolbarIcon 
            themeColor={themeColor} 
            blackIcon={blackCenterAlignIcon} 
            whiteIcon={whiteCenterAlignIcon} 
          />
        </button>
        {/* Right */}
        <button
          data-active-key="right"
          onMouseDown={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <ToolbarIcon 
            themeColor={themeColor} 
            blackIcon={blackRightAlignIcon} 
            whiteIcon={whiteRightAlignIcon} 
          />
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default TextAlignButton
