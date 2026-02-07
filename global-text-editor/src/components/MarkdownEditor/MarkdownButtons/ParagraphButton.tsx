import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackParagprahIcon from "assets/NormalTypeIcons/icons8-paragraph-black-96.png"
import whiteParagraphIcon from "assets/NormalTypeIcons/icons8-paragraph-white-96.png"


function ParagraphButton({ 
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
        editor.chain().focus().setParagraph().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackParagprahIcon}
        whiteIcon={whiteParagraphIcon}
        fileId={fileId}
      />
    </button>
  )
}

export default ParagraphButton
