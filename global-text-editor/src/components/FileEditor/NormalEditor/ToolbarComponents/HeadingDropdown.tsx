import { useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownComponent from "./DropdownComponent"

function HeadingDropdown({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  if (!editor) return null

  const levels = [1, 2, 3, 4, 5] as const

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Always shows "H" + down arrow */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        H <span aria-hidden="true">▾</span>
      </button>

      <DropdownComponent
        open={open}
        onClose={() => setOpen(false)}
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
                setOpen(false)
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
      </DropdownComponent>
    </div>
  )
}

export default HeadingDropdown
