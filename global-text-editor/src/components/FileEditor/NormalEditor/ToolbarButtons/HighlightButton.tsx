import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-black-96.png"
import whiteHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-white-96.png"


function HighlightButton({ 
  editor,
  editorTheme
}: {
  editor: Editor | null
  editorTheme: "black" | "white"
}) {
  if (!editor) return null

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleHighlight().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackHighlightIcon}
        whiteIcon={whiteHighlightIcon}
        editorTheme={editorTheme}
      />
    </button>
  )
}

export default HighlightButton
