import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import whiteHideIcon from "assets/NormalTypeIcons/icons8-hide-white-96.png"
import blackHideIcon from "assets/NormalTypeIcons/icons8-hide-black-96.png"
import blackShowIcon from "assets/NormalTypeIcons/icons8-show-black-96.png"
import whiteShowIcon from "assets/NormalTypeIcons/icons8-show-white-96.png"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"
import type { Dispatch, SetStateAction } from "react"


function HideShowButton({
  fileId,
  toolbarIsVisible,
  setToolbarIsVisible,  
}: {
  fileId: number
  toolbarIsVisible: boolean
  setToolbarIsVisible: Dispatch<SetStateAction<boolean>>
}) {

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
          fileId={fileId}
        />
        : <ToolbarIcon 
          blackIcon={blackHideIcon}
          whiteIcon={whiteHideIcon}
          fileId={fileId}
        />
    }

    </button>
  )
}

export default HideShowButton
