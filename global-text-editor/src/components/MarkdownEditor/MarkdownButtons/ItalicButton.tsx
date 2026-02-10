import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackItalicIcon from "assets/NormalTypeIcons/icons8-italic-black-96.png"
import whiteItalicIcon from "assets/NormalTypeIcons/icons8-italic-white-96.png"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"
import EditorIcon from "shared/EditorIcon"


function ItalicButton() {
  
  const { editor } = useMarkdownEditorContext()

  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isItalic: editor.isActive("italic")
    })
  })

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleItalic().run()
      }}
    >
      <EditorIcon 
        blackIcon={blackItalicIcon}
        whiteIcon={whiteItalicIcon}
        isActive={editorState.isItalic}
      />
    </button>
  )
}

export default ItalicButton
