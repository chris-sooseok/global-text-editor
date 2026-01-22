import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import whiteHideIcon from "assets/NormalTypeIcons/icons8-hide-white-96.png"
import blackHideIcon from "assets/NormalTypeIcons/icons8-hide-black-96.png"
import blackShowIcon from "assets/NormalTypeIcons/icons8-show-black-96.png"
import whiteShowIcon from "assets/NormalTypeIcons/icons8-show-white-96.png"


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
      onMouseDown={(e) => {
        e.preventDefault()
        setToolbarIsVisible((prev) => !prev)
      }}
    >
      {toolbarIsVisible 
        ? <ToolbarIcon 
          blackIcon={blackShowIcon}
          whiteIcon={whiteShowIcon}
        />
        : <ToolbarIcon 
          blackIcon={blackHideIcon}
          whiteIcon={whiteHideIcon}
        />
    }

    </button>
  )
}

export default HideShowButton
