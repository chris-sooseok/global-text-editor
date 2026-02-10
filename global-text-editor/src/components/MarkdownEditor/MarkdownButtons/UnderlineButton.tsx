import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-black-96.png"
import whiteUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-white-96.png"


function UnderlineButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  
    const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isUnderline: editor.isActive('underline')
    })
  })

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
        isActive={editorState.isUnderline}
      />
    </button>
  )
}

export default UnderlineButton
