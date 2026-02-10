import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import blackSuperscriptIcon from "assets/NormalTypeIcons/superscript-black.png"
import whiteSuperscriptIcon from "assets/NormalTypeIcons/superscript-white.png"
import { useMarkdownEditorContext } from "context/EditorContext"
import EditorIcon from "shared/EditorIcon"

function SuperscriptButton() {

  const { editor } = useMarkdownEditorContext()
  const editorState = useEditorState({
    editor,
    selector: ({ editor}: { editor: Editor}) => ({
      isSuperscript: editor.isActive("superscript")
    })
  })

  return (
      <button
        type="button"
        aria-label="Superscript"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleSuperscript().run()
        }}
      >
        <EditorIcon 
          blackIcon={blackSuperscriptIcon}
          whiteIcon={whiteSuperscriptIcon}
          isActive={editorState.isSuperscript}
        />
      </button>
  )
}

export default SuperscriptButton
