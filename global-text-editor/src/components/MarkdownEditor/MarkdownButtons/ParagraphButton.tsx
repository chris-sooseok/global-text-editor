import type { Editor } from "@tiptap/core"
import { useEditorState } from '@tiptap/react'
import ToolbarIcon from "shared/ToolbarIcon"
import blackParagprahIcon from "assets/NormalTypeIcons/icons8-paragraph-black-96.png"
import whiteParagraphIcon from "assets/NormalTypeIcons/icons8-paragraph-white-96.png"


function ParagraphButton({ 
  editor,
  fileId
}: { 
  editor: Editor
  fileId: number
}) {
  
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isParagraph: editor.isActive("paragraph")
    })
  })

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
        isActive={editorState.isParagraph}
      />
    </button>
  )
}

export default ParagraphButton
