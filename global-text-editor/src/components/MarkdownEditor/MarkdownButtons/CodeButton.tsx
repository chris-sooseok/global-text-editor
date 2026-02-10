import type { Editor } from "@tiptap/core"
import { useEditorState } from '@tiptap/react'
import ToolbarIcon from "shared/ToolbarIcon"
import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"

function CodeButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isCode: editor.isActive("code")
    })
  })

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
        isActive={editorState.isCode}
      />
    </button>
  )
}

export default CodeButton
