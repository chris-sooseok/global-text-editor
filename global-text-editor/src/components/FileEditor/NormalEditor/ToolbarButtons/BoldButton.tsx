import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackBoldIcon from "assets/NormalTypeIcons/icons8-bold-black-96.png"
import whiteBoldIcon from "assets/NormalTypeIcons/icons8-bold-white-96.png"


function BoldButton({ 
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
        editor.chain().focus().toggleBold().run()
      }}
    >
      <ToolbarIcon 
        themeColor={themeColor}
        blackIcon={blackBoldIcon}
        whiteIcon={whiteBoldIcon}
      />
    </button>
  )
}

export default BoldButton
