import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import EditorIcon from "shared/EditorIcon"
import blackQuoteIcon from "assets/NormalTypeIcons/icons8-quote-black-96.png"
import whiteQuoteIcon from "assets/NormalTypeIcons/icons8-quote-white-96.png"
import { useMarkdownEditorContext } from "context/EditorContext"

function BackQuoteButton() {
  
  const { editor } = useMarkdownEditorContext()
  
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isBlockquote: editor.isActive("blockquote")
    })
  })

  return (
    <button
      tabIndex={-1}
      type="button"
      aria-label="Toggle blockquote"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleBlockquote().run()
      }}
    >
      <EditorIcon 
        blackIcon={blackQuoteIcon}
        whiteIcon={whiteQuoteIcon}
        isActive={editorState.isBlockquote}
      />
    </button>
  )
}

export default BackQuoteButton
