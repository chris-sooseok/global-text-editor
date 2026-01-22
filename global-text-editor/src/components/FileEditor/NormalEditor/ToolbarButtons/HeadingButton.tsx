import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"

import blackHIcon from "assets/NormalTypeIcons/icons8-h-black-96.png"
import whiteHIcon from "assets/NormalTypeIcons/icons8-h-white-96.png"

function HeadingButton({
  editor,
}: {
  editor: Editor | null
}) {
  if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
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
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen((v) => !v)
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
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        activeCheck={(level) => editor.isActive("heading", { level: Number(level) })}
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
                setDropdownIsOpen(false)
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
