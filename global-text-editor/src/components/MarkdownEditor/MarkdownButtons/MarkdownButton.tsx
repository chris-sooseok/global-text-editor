import blackMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-black-96.png"
import whiteMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-white-96.png"
import blackJsonIcon from "assets/NormalTypeIcons/icons8-json-black-96.png"
import whiteJsonIcon from "assets/NormalTypeIcons/icons8-json-white-96.png"
import EditorIcon from "shared/EditorIcon"

function MarkdownButton({
  isMarkdownView,
  toggleMarkdownView,
}: {
  isMarkdownView: boolean
  toggleMarkdownView: () => void
}) {
  const blackIcon = isMarkdownView ? blackJsonIcon : blackMarkdownIcon
  const whiteIcon = isMarkdownView ? whiteJsonIcon : whiteMarkdownIcon

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        toggleMarkdownView()
      }}
    >
      <EditorIcon blackIcon={blackIcon} whiteIcon={whiteIcon}/>
    </button>
  )
}

export default MarkdownButton
