import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import DropdownOverlay from "../../../../shared/DropdownOverlay"
import ToolbarIcon from "./Components/ToolbarIcon"

import blackHIcon from "assets/NormalTypeIcons/icons8-h-black-96.png"
import whiteHIcon from "assets/NormalTypeIcons/icons8-h-white-96.png"

function HeadingButton({
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const levels = [1, 2, 3, 4] as const

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
        style={{
          background: "rgba(255,255,255,0.05)",
        }}
        aria-haspopup="menu"
        aria-expanded={dropdownIsOpen}
      >
        <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={blackHIcon}
          whiteIcon={whiteHIcon}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        themeColor={themeColor}
      >
        {levels.map((level) => {
          const isActive = editor.isActive("heading", { level })

          return (
            <button
              key={level}
              type="button"
              role="menuitem"
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().focus().toggleHeading({ level }).run()
                setDropdownIsOpen(false)
              }}
              style={{
                padding: "1px",
                background: isActive ? "rgba(67, 102, 158, 0.18)" : "transparent",
              }}
            >
              Heading {level}
            </button>
          )
        })}
      </DropdownOverlay>
    </div>
  )
}

export default HeadingButton
