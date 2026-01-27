import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-black-96.png"
import whiteCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-white-96.png"

function CodeBlockButton({
  editor,
  fileId
}: {
  editor: Editor | null
  fileId: number
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
        blackIcon={blackCodeBlockIcon}
        whiteIcon={whiteCodeBlockIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default CodeBlockButton
