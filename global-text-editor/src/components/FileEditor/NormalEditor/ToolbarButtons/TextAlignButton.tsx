import { useState, useRef} from "react"
import type { Editor } from "@tiptap/core"
import DropdownComponent from "../../../../shared/DropdownOverlay"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
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
  const leftAlignIcon = themeColor === "black" ? whiteLeftAlignIcon : blackLeftAlignIcon
  const centerAlignIcon = themeColor === "black" ? whiteCenterAlignIcon : blackCenterAlignIcon
  const rightAlignIcon = themeColor === "black" ? whiteRightAlignIcon : blackRightAlignIcon
  const justifyAlignIcon = themeColor === "black" ? whiteJustifyAlignIcon : blackJustifyAlignIcon


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
        aria-label="Alignment options"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen(dropdownIsOpen ? false : true)
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
        }}
        aria-haspopup="menu"
        aria-expanded={dropdownIsOpen}
      >
        <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={blackJustifyAlignIcon}
          whiteIcon={whiteJustifyAlignIcon}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownComponent 
        dropdownIsOpen={dropdownIsOpen} 
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        themeColor={themeColor}
      >
        {/* Justify */}
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("justify").run()
            setDropdownIsOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "justify" }) ? "rgba(67, 102, 158, 0.18)" : "transparent",
          }}
        >
          <img src={justifyAlignIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
        </button>

        {/* Left */}
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("left").run()
            setDropdownIsOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
          }}
        >
          <img src={leftAlignIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
        </button>

        {/* Center */}
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("center").run()
            setDropdownIsOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "center" }) ? "rgba(67, 102, 158, 0.18)" : "transparent",
          }}
        >
          <img src={centerAlignIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
        </button>

        {/* Right */}
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("right").run()
            setDropdownIsOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "right" }) ? "rgba(67, 102, 158, 0.18)" : "transparent",
          }}
        >
          <img src={rightAlignIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
        </button>

      </DropdownComponent>
    </div>
  )
}

export default TextAlignButton
