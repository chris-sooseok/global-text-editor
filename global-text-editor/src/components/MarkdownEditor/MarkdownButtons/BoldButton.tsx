import { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackBoldIcon from "assets/NormalTypeIcons/icons8-bold-black-96.png"
import whiteBoldIcon from "assets/NormalTypeIcons/icons8-bold-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"


function BoldButton(){

  const { editor } = useMarkdownEditorContext()

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
      <EditorIcon 
        blackIcon={blackBoldIcon}
        whiteIcon={whiteBoldIcon}
        isActive={editorState.isBold}
      />
    </button>
  )
}

export default BoldButton
