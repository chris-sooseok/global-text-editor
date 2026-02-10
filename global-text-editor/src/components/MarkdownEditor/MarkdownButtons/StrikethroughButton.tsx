import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-black-96.png"
import whiteStrikeIcon from "assets/NormalTypeIcons/icons8-strikethrough-white-96.png"
import { useMarkdownEditorContext } from "context/EditorContext"
import EditorIcon from "shared/EditorIcon"


function StrikethroughButton() {

  const { editor } = useMarkdownEditorContext()
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isStrike: editor.isActive("strike")
    })
  })

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleStrike().run()
      }}
    >
      <EditorIcon 
        blackIcon={blackStrikeIcon}
        whiteIcon={whiteStrikeIcon}
        isActive={editorState.isStrike}
      />
    </button>
  )
}

export default StrikethroughButton
