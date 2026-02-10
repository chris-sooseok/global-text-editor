import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import { DropdownOverlay } from "shared/DropdownOverlay"

import blackHIcon from "assets/NormalTypeIcons/icons8-h-black-96.png"
import whiteHIcon from "assets/NormalTypeIcons/icons8-h-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"

function HeadingButton() {

  const { editor } = useMarkdownEditorContext()

  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
  
  const levels = [1, 2, 3, 4] as const
  
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isHeading1: editor.isActive("heading", { level: 1 }),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
      isHeading4: editor.isActive("heading", { level: 4 }), 
    })
  })

  const activeLevel =
    editorState.isHeading1 ? 1 :
    editorState.isHeading2 ? 2 :
    editorState.isHeading3? 3 :
    editorState.isHeading4 ? 4 :
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
        <EditorIcon
          blackIcon={blackHIcon}
          whiteIcon={whiteHIcon}
          isActive={activeLevel ? true : false}
        />

        {activeLevel ? (
          <span
            style={{
              position: "absolute",
              right: 0,
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
