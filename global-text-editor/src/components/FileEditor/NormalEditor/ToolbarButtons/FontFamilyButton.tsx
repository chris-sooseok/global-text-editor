import { useState, useRef } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import blackFontIcon from "assets/NormalTypeIcons/icons8-font-black-96.png"
import whiteFontIcon from "assets/NormalTypeIcons/icons8-font-white-96.png"


function FontFamilyButton({
  editor,
  editorTheme
}: {
  editor: Editor | null
  editorTheme: "black" | "white"
}) {
  if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // simple helper to apply to selection or cursor
  function setFontFamily(fontFamily: string) {
    if(editor)
    editor.chain().focus().setMark("textStyle", { fontFamily }).run()
  }

  // active state helper (reads current textStyle mark)
  function isActiveFontFamily(fontFamily: string) {
    let ff
    if (editor)
    ff = editor.getAttributes("textStyle")?.fontFamily as string | undefined
    return ff === fontFamily
  }

  const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  const INTER = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
  const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Toolbar Button */}
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen((v) => !v)
        }}
      >
        <ToolbarIcon 
            blackIcon={blackFontIcon}
            whiteIcon={whiteFontIcon}
            editorTheme={editorTheme}
        />
      </button>

      {/* Dropdown Options */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        activeCheck={(key) => isActiveFontFamily(String(key))}
        scrollable={true}
      >
        <button
          data-active-key={MONO}
          onMouseDown={() => setFontFamily(MONO)}
        >
          <span>Monospace</span>
        </button>

        <button
          data-active-key={INTER}
          onMouseDown={() => setFontFamily(INTER)}
        >
          <span>Inter</span>
        </button>

        <button
          data-active-key={SERIF}
          onMouseDown={() => setFontFamily(SERIF)}
        >
          <span>Serif</span>
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default FontFamilyButton
