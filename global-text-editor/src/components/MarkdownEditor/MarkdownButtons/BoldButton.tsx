import { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackBoldIcon from "assets/NormalTypeIcons/icons8-bold-black-96.png"
import whiteBoldIcon from "assets/NormalTypeIcons/icons8-bold-white-96.png"


function BoldButton({ 
  editor,
  fileId
}: { 
  editor: Editor
  fileId: number
}) {

  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isBold: editor.isActive("bold")
    })
  })

  return (
    <button
      tabIndex={-1} 
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBold().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackBoldIcon}
        whiteIcon={whiteBoldIcon}
        fileId={fileId}
        isActive={editorState.isBold}
      />
    </button>
  )
}

export default BoldButton
