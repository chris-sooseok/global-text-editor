import { useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownComponent from "./DropdownComponent"

import blackBulletIcon from "assets/NormalTypeIcons/icons8-list-black-96.png"
import whiteBulletIcon from "assets/NormalTypeIcons/icons8-list-white-96.png"
import blackNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-black-96.png"
import whiteNumberedIcon from "assets/NormalTypeIcons/icons8-numbered-list-white-96.png"
import blackTaskIcon from "assets/NormalTypeIcons/icons8-task-list-black-96.png"
import whiteTaskIcon from "assets/NormalTypeIcons/icons8-task-list-white-96.png"

function ListDropdown({
  editor,
  isLight,
}: {
  editor: Editor | null
  isLight: boolean
}) {
  const [open, setOpen] = useState(false)

  if (!editor) return null

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="List options"
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
        <span aria-hidden="true">≡</span>
      </button>

      <DropdownComponent
        open={open}
        onClose={() => setOpen(false)}
        items={[
          {
            key: "bullet",
            label: "Bullet list",
            iconSrc: isLight ? blackBulletIcon : whiteBulletIcon,
            isActive: editor.isActive("bulletList"),
            onMouseDown: (e) => {
              e.preventDefault()
              editor.chain().focus().toggleBulletList().run()
              setOpen(false)
            },
          },
          {
            key: "ordered",
            label: "Ordered list",
            iconSrc: isLight ? blackNumberedIcon : whiteNumberedIcon,
            isActive: editor.isActive("orderedList"),
            onMouseDown: (e) => {
              e.preventDefault()
              editor.chain().focus().toggleOrderedList().run()
              setOpen(false)
            },
          },
          {
            key: "task",
            label: "Task list",
            iconSrc: isLight ? blackTaskIcon : whiteTaskIcon,
            isActive: editor.isActive("taskList"),
            onMouseDown: (e) => {
              e.preventDefault()
              editor.chain().focus().toggleTaskList().run()
              setOpen(false)
            },
          },
        ]}
      />
    </div>
  )
}

export default ListDropdown
