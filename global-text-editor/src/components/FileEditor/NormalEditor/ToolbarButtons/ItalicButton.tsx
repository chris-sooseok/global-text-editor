import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackItalicIcon from "assets/NormalTypeIcons/icons8-italic-black-96.png"
import whiteItalicIcon from "assets/NormalTypeIcons/icons8-italic-white-96.png"


function ItalicButton({ 
  editor,
}: {
  editor: Editor | null
}) {
  if (!editor) return null

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleItalic().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackItalicIcon}
        whiteIcon={whiteItalicIcon}
      />
    </button>
  )
}

export default ItalicButton
