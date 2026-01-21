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

  const isActive = editor.isActive("codeBlock")

  return (
    <button
      type="button"
      aria-label="Code block"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleCodeBlock().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
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
