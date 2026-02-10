import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"
import blackItalicIcon from "assets/NormalTypeIcons/icons8-italic-black-96.png"
import whiteItalicIcon from "assets/NormalTypeIcons/icons8-italic-white-96.png"


function ItalicButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  
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
      <ToolbarIcon 
        blackIcon={blackItalicIcon}
        whiteIcon={whiteItalicIcon}
        fileId={fileId}
        isActive={editorState.isItalic}
      />
    </button>
  )
}

export default ItalicButton
