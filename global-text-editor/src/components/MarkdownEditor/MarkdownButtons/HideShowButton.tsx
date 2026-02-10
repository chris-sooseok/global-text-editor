import whiteHideIcon from "assets/NormalTypeIcons/icons8-hide-white-96.png"
import blackHideIcon from "assets/NormalTypeIcons/icons8-hide-black-96.png"
import blackShowIcon from "assets/NormalTypeIcons/icons8-show-black-96.png"
import whiteShowIcon from "assets/NormalTypeIcons/icons8-show-white-96.png"
import type { Dispatch, SetStateAction } from "react"
import EditorIcon from "shared/EditorIcon"


function HideShowButton({
  toolbarIsVisible,
  setToolbarIsVisible,  
}: {
  toolbarIsVisible: boolean
  setToolbarIsVisible: Dispatch<SetStateAction<boolean>>
}) {

  return (
    <button
      tabIndex={-1}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        setToolbarIsVisible((prev) => !prev)
      }}
    >
      {toolbarIsVisible 
        ? <EditorIcon 
          blackIcon={blackShowIcon}
          whiteIcon={whiteShowIcon}
        />
        : <EditorIcon 
          blackIcon={blackHideIcon}
          whiteIcon={whiteHideIcon}
        />
    }

    </button>
  )
}

export default HideShowButton
