import type { Editor } from "@tiptap/core"
import { useEditorState } from '@tiptap/react'
import blackParagprahIcon from "assets/NormalTypeIcons/icons8-paragraph-black-96.png"
import whiteParagraphIcon from "assets/NormalTypeIcons/icons8-paragraph-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"


function ParagraphButton() {
  
  const { editor } = useMarkdownEditorContext()

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
      <EditorIcon 
        blackIcon={blackParagprahIcon}
        whiteIcon={whiteParagraphIcon}
        isActive={editorState.isParagraph}
      />
    </button>
  )
}

export default ParagraphButton
