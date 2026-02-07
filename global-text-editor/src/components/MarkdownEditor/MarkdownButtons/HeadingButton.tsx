import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import { DropdownOverlay } from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"

import blackHIcon from "assets/NormalTypeIcons/icons8-h-black-96.png"
import whiteHIcon from "assets/NormalTypeIcons/icons8-h-white-96.png"

function HeadingButton({
  editor,
  fileId
}: {
  editor: Editor | null
  fileId: number
}) {
  if (!editor) return null

  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
  
  const levels = [1, 2, 3, 4] as const
  
  const activeLevel =
    editor.isActive("heading", { level: 1 }) ? 1 :
    editor.isActive("heading", { level: 2 }) ? 2 :
    editor.isActive("heading", { level: 3 }) ? 3 :
    editor.isActive("heading", { level: 4 }) ? 4 :
    null
  
  return (
    <div style={{ 
      position: "relative",
      display: "flex",
      alignItems: "center"
    }}>
      {/* Toolbar Button */}
      <button
        tabIndex={-1}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ToolbarIcon
          blackIcon={blackHIcon}
          whiteIcon={whiteHIcon}
          fileId={fileId}
        />

        {activeLevel ? (
          <span
            style={{
              position: "absolute",
              right: -2,
              bottom: 1,
              fontSize: 10,
              lineHeight: "10px",
            }}
          >
            {activeLevel}
          </span>
        ) : null}
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        {levels.map((level) => {
          return (
            <button
              key={level}
              data-active-key={level}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().focus().toggleHeading({ level }).run()
                setDropdown({ open: true, x: e.clientX, y: e.clientY })
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
