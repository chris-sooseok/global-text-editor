import { useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownComponent from "./DropdownComponent"

import blackLeftAlignIcon from "assets/NormalTypeIcons/icons8-align-left-black-96.png"
import whiteLeftAlignIcon from "assets/NormalTypeIcons/icons8-align-left-white-96.png"

import blackRightAlignIcon from "assets/NormalTypeIcons/icons8-align-right-black-96.png"
import whiteRightAlignIcon from "assets/NormalTypeIcons/icons8-align-right-white-96.png"

import blackJustifyAlignIcon from "assets/NormalTypeIcons/icons8-align-justify-black-96.png"
import whiteJustifyAlignIcon from "assets/NormalTypeIcons/icons8-align-justify-white-96.png"



function AlignDropdown({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)

  if (!editor) return null

  return (
    <div style={{ position: "relative" }}>
      {/* icon: alignment (not dynamic) */}
      <button
        type="button"
        aria-label="Alignment options"
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
        ≡ <span aria-hidden="true">▾</span>
      </button>

      <DropdownComponent open={open} onClose={() => setOpen(false)}>
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("left").run()
            setOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "left" })
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          Align left
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("center").run()
            setOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "center" })
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          Align center
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("right").run()
            setOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "right" })
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          Align right
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign("justify").run()
            setOpen(false)
          }}
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            background: editor.isActive({ textAlign: "justify" })
              ? "rgba(67, 102, 158, 0.18)"
              : "transparent",
          }}
        >
          Justify
        </button>
      </DropdownComponent>
    </div>
  )
}

export default AlignDropdown
