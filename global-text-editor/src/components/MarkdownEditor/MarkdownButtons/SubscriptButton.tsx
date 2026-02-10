import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSubscriptIcon from "assets/NormalTypeIcons/subscript-black.png"
import whiteSubscriptIcon from "assets/NormalTypeIcons/subscript-white.png"

function SubscriptButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {

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
        <ToolbarIcon 
          blackIcon={blackSubscriptIcon}
          whiteIcon={whiteSubscriptIcon}
          fileId={fileId}
          isActive={editorState.isSubscript}
        />
      </button>
  )
}

export default SubscriptButton
