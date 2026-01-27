import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"

function CodeButton({ 
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
        editor.chain().focus().toggleCode().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackCodeIcon}
        whiteIcon={whiteCodeIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default CodeButton
