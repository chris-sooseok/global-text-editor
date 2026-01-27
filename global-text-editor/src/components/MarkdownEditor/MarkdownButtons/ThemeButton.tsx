
import ToolbarIcon from "shared/ToolbarIcon"
import blackSunIcon from "assets/NormalTypeIcons/icons8-sun-black-96.png"
import whiteSunIcon from "assets/NormalTypeIcons/icons8-sun-white-96.png"
import blackMoonIcon from "assets/NormalTypeIcons/icons8-moon-black-96.png"
import whiteMoonIcon from "assets/NormalTypeIcons/icons8-moon-white-96.png"
import { ThemeManagerStore, } from "store/ThemeStore/ThemeManagerStore"

function ThemeButton({fileId }: {fileId: number}) {

  const editorTheme = ThemeManagerStore((s) => 
      s.fileConfigByFileId[fileId]?.editorTheme ?? "black")

  const { changeEditorTheme } = ThemeManagerStore.getState()
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        if (editorTheme === "black") {
          changeEditorTheme(fileId, "white")
        }else{
          changeEditorTheme(fileId, "black")
        }
      }}
    >
    {editorTheme === "black" 
      ? <ToolbarIcon 
        blackIcon={blackSunIcon}
        whiteIcon={whiteSunIcon}
        fileId={fileId}/>
      : <ToolbarIcon 
        blackIcon={blackMoonIcon}
        whiteIcon={whiteMoonIcon}
        fileId={fileId}
      />
   
    }

    </button>
  )
}

export default ThemeButton
