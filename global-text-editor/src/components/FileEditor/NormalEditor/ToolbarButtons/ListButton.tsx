import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "../../../../shared/DropdownOverlay"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackBulletIcon from "assets/NormalTypeIcons/icons8-list-black-96.png"
import whiteBulletIcon from "assets/NormalTypeIcons/icons8-list-white-96.png"
import blackNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-black-96.png"
import whiteNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-white-96.png"
import blackTaskIcon from "assets/NormalTypeIcons/icons8-task-list-black-96.png"
import whiteTaskIcon from "assets/NormalTypeIcons/icons8-task-list-white-96.png"

import type { themeColorType } from "../NormalEditor"

function ListButton({
  editor,
  themeColor,
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
  if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const bulletIcon = themeColor === "black" ? whiteBulletIcon : blackBulletIcon
  const numberedIcon = themeColor === "black" ? whiteNumberedIcon : blackNumberedIcon
  const taskIcon = themeColor === "black" ? whiteTaskIcon : blackTaskIcon

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
        aria-label="List options"
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
          blackIcon={blackBulletIcon}
          whiteIcon={whiteBulletIcon}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        themeColor={themeColor}
      >
        <button
          type="button"

          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
            setDropdownIsOpen(false)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 8,
            background: editor.isActive("bulletList")
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          <img src={bulletIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
          <span>Bullet list</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
            setDropdownIsOpen(false)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 8,
            background: editor.isActive("orderedList")
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          <img src={numberedIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
          <span>Ordered list</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleTaskList().run()
            setDropdownIsOpen(false)
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 8,
            background: editor.isActive("taskList")
              ? "rgba(3, 98, 251, 0.18)"
              : "transparent",
          }}
        >
          <img src={taskIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
          <span>Task list</span>
        </button>
      </DropdownOverlay>

    </div>
  )
}

export default ListButton
