import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"
import ToolbarIcon from "shared/ToolbarIcon"

import blackSuperscriptIcon from "assets/NormalTypeIcons/superscript-black.png"
import whiteSuperscriptIcon from "assets/NormalTypeIcons/superscript-white.png"

function SuperscriptButton({ 
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {

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
        <ToolbarIcon 
          blackIcon={blackSuperscriptIcon}
          whiteIcon={whiteSuperscriptIcon}
          fileId={fileId}
          isActive={editorState.isSuperscript}
        />
      </button>
  )
}

export default SuperscriptButton
