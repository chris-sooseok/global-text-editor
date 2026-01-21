import type { Editor } from "@tiptap/core"

import blackCodeIcon from "assets/NormalTypeIcons/icons8-code-black-96.png"
import whiteCodeIcon from "assets/NormalTypeIcons/icons8-code-white-96.png"

function CodeButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const isActive = editor.isActive("code")

  return (
    <button
      type="button"
      aria-label="Inline code"
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().focus().toggleCode().run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      {"</>"}
    </button>
  )
}

export default CodeButton
