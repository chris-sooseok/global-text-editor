import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-black-96.png"
import whiteUnderlineIcon from "assets/NormalTypeIcons/icons8-underline-white-96.png"
import { useMarkdownEditorContext } from "context/EditorContext"
import EditorIcon from "shared/EditorIcon"


function UnderlineButton() {
  
  const { editor } = useMarkdownEditorContext()

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
      <EditorIcon 
        blackIcon={blackUnderlineIcon}
        whiteIcon={whiteUnderlineIcon}
        isActive={editorState.isUnderline}
      />
    </button>
  )
}

export default UnderlineButton
