import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"

function CodeButton({ 
  editor,
  editorTheme
}: {
  editor: Editor | null
  editorTheme: "black" | "white"
}) {
  if (!editor) return null

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleCode().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackCodeIcon}
        whiteIcon={whiteCodeIcon}
        editorTheme={editorTheme}
      />
    </button>
  )
}

export default CodeButton
