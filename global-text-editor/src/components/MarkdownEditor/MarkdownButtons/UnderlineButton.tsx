import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-black-96.png"
import whiteUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-white-96.png"


function UnderlineButton({ 
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
        editor.chain().focus().toggleUnderline().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackUnderlineIcon}
        whiteIcon={whiteUnderlineIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default UnderlineButton
