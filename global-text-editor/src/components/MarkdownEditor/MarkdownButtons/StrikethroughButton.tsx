import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-black-96.png"
import whiteStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-white-96.png"


function StrikethroughButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {

  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isStrike: editor.isActive("strike")
    })
  })

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
        isActive={editorState.isStrike}
      />
    </button>
  )
}

export default StrikethroughButton
