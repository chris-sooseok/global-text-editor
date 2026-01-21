import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import blackCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-black-96.png"
import whiteCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-white-96.png"

function CodeBlockButton({
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
        editor.chain().focus().toggleCodeBlock().run()
      }}
    >
      <ToolbarIcon 
        themeColor={themeColor} 
        blackIcon={blackCodeBlockIcon}
        whiteIcon={whiteCodeBlockIcon}
      />
    </button>
  )
}

export default CodeBlockButton
