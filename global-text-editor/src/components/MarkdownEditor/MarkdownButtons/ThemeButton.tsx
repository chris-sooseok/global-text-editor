
import Icon from "shared/Icon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"
import { ThemeManagerStore, } from "store/ThemeStore/ThemeManagerStore"
import EditorIcon from "shared/EditorIcon"
import { useMarkdownEditorContext } from "context/MarkdownEditorContext"

function ThemeButton() {

  const { editorTheme } = useMarkdownEditorContext().contentConfig
  
  const { changeEditorTheme } = ThemeManagerStore.getState()
  return (
    <button
      type="button"
      // onMouseDown={(e) => {
      //   e.preventDefault()
      //   if (editorTheme === "black") {
      //     changeEditorTheme(fileId, "white")
      //   }else{
      //     changeEditorTheme(fileId, "black")
      //   }
      // }}
    >
    {editorTheme === "black" 
      ? <EditorIcon 
        blackIcon={blackSunIcon}
        whiteIcon={whiteSunIcon}
        />
      : <EditorIcon 
        blackIcon={blackMoonIcon}
        whiteIcon={whiteMoonIcon}
        />
   
    }

    </button>
  )
}

export default ThemeButton
