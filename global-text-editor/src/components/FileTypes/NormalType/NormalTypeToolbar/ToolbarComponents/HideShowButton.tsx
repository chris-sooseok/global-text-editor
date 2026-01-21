import type { Editor } from "@tiptap/core"

import whiteHideIcon from "assets/NormalTypeIcons/icons8-hide-white-96.png"
import blackHideIcon from "assets/NormalTypeIcons/icons8-hide-black-96.png"

function HideShowButton({
  editor,
  toolbarIsVisible,
  setToolbarIsVisible,
}: {
  editor: Editor | null
  toolbarIsVisible: boolean
  setToolbarIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
  if (!editor) return null

  return (
    <button
      type="button"
      aria-label={toolbarIsVisible ? "Hide toolbar" : "Show toolbar"}
      onMouseDown={(e) => {
        e.preventDefault()
        setToolbarIsVisible((v) => !v)
      }}
      style={{
        background: toolbarIsVisible ? "rgba(255,255,255,0.05)" : "rgba(67, 102, 158, 0.18)",
      }}
    >
      {toolbarIsVisible ? "Hide" : "Show"}
    </button>
  )
}

export default HideShowButton
