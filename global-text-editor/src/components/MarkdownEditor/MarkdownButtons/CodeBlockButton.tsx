import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-black-96.png"
import whiteCodeBlockIcon from "assets/NormalTypeIcons/icons8-code-block-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"

function CodeBlockButton() {
  
  const { editor } = useMarkdownEditorContext()

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
      <EditorIcon 
        blackIcon={blackCodeBlockIcon}
        whiteIcon={whiteCodeBlockIcon}
        isActive={editorState.isCodeBlock}
      />
    </button>
  )
}

export default CodeBlockButton
