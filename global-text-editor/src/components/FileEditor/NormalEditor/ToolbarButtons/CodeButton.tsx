import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"

function CodeButton({ 
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
        editor.chain().focus().toggleCode().run()
      }}
    >
      <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackCodeIcon}
        whiteIcon={whiteCodeIcon}
      />
    </button>
  )
}

export default CodeButton
