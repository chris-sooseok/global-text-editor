import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-black-96.png"
import whiteCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-white-96.png"

function CodeBlockButton({
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isCodeBlock: editor.isActive("codeBlock")
    })
  })

  return (
    <button
      tabIndex={-1}
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
        isActive={editorState.isCodeBlock}
      />
    </button>
  )
}

export default CodeBlockButton
