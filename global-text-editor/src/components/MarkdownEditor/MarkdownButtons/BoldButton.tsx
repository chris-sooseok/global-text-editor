import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackBoldIcon from "assets/NormalTypeIcons/icons8-bold-black-96.png"
import whiteBoldIcon from "assets/NormalTypeIcons/icons8-bold-white-96.png"


function BoldButton({ 
  editor,
  fileId
}: { 
  editor: Editor | null
  fileId: number
}) {
  if (!editor) return null

  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
  if (!editor) return
  const sync = () => setIsActive(editor.isActive("bold"))
  sync()
  editor.on("selectionUpdate", sync)
  editor.on("update", sync)
  return () => {
    editor.off("selectionUpdate", sync)
    editor.off("update", sync)
  }
}, [editor])

  return (
    <button
      tabIndex={-1} 
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        console.log(isActive)
        editor.chain().focus().toggleBold().run()
      }}
    >
      <ToolbarIcon 
        blackIcon={blackBoldIcon}
        whiteIcon={whiteBoldIcon}
        fileId={fileId}
        isActive={isActive}
      />
    </button>
  )
}

export default BoldButton
