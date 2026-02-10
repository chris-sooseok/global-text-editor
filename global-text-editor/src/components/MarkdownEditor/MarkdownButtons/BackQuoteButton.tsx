import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackQuoteIcon from "assets/NormalTypeIcons/icons8-quote-black-96.png"
import whiteQuoteIcon from "assets/NormalTypeIcons/icons8-quote-white-96.png"

function BackQuoteButton({
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  
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
      <ToolbarIcon 
        blackIcon={blackQuoteIcon}
        whiteIcon={whiteQuoteIcon}
        fileId={fileId}
        isActive={editorState.isBlockquote}
      />
    </button>
  )
}

export default BackQuoteButton
