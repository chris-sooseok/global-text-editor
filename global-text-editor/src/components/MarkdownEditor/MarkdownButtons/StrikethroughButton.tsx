import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-black-96.png"
import whiteStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-white-96.png"


function StrikethroughButton({ 
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
        editor.chain().focus().toggleStrike().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackStrikeIcon}
        whiteIcon={whiteStrikeIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default StrikethroughButton
