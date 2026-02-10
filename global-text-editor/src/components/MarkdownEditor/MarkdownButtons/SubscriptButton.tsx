import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackSubscriptIcon from "assets/NormalTypeIcons/subscript-black.png"
import whiteSubscriptIcon from "assets/NormalTypeIcons/subscript-white.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"

function SubscriptButton() {

  const { editor } = useMarkdownEditorContext()
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isSubscript: editor.isActive("subscript")
    })
  })

  return (
      <button
        type="button"
        aria-label="Subscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSubscript().run()
        }}
      >
        <EditorIcon 
          blackIcon={blackSubscriptIcon}
          whiteIcon={whiteSubscriptIcon}
          isActive={editorState.isSubscript}
        />
      </button>
  )
}

export default SubscriptButton
