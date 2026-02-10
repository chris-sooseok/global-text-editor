import type { Editor } from "@tiptap/core"
import { useEditorState } from '@tiptap/react'
import Icon from "shared/Icon"
import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"

function CodeButton() {
  const { editor } = useMarkdownEditorContext()

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
      <EditorIcon 
        blackIcon={blackCodeIcon}
        whiteIcon={whiteCodeIcon}
        isActive={editorState.isCode}
      />
    </button>
  )
}

export default CodeButton
