import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import ToolbarIcon from "./Components/ToolbarIcon"
import whiteHideIcon from "assets/NormalTypeIcons/icons8-hide-white-96.png"
import blackHideIcon from "assets/NormalTypeIcons/icons8-hide-black-96.png"
import blackShowIcon from "assets/NormalTypeIcons/icons8-show-black-96.png"
import whiteShowIcon from "assets/NormalTypeIcons/icons8-show-white-96.png"


function HideShowButton({
  editor,
  themeColor,
  toolbarIsVisible,
  setToolbarIsVisible,
  
}: {
  editor: Editor | null
  themeColor: themeColorType
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
          themeColor={themeColor} 
          blackIcon={blackShowIcon}
          whiteIcon={whiteShowIcon}
        />
        : <ToolbarIcon 
          themeColor={themeColor} 
          blackIcon={blackHideIcon}
          whiteIcon={whiteHideIcon}
        />
    }

    </button>
  )
}

export default HideShowButton
