import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "shared/ToolbarIcon"
import blackItalicIcon from "assets/NormalTypeIcons/icons8-italic-black-96.png"
import whiteItalicIcon from "assets/NormalTypeIcons/icons8-italic-white-96.png"


function ItalicButton({ 
  editor,
  themeColor
}: {
  editor: Editor | null
  themeColor: themeColorType
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
        themeColor={themeColor} 
        blackIcon={blackItalicIcon}
        whiteIcon={whiteItalicIcon}
      />
    </button>
  )
}

export default ItalicButton
