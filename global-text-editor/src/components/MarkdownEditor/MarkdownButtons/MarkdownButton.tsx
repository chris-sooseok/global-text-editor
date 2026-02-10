import ToolbarIcon from "shared/ToolbarIcon"
import blackMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-black-96.png"
import whiteMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-white-96.png"
import blackJsonIcon from "assets/NormalTypeIcons/icons8-json-black-96.png"
import whiteJsonIcon from "assets/NormalTypeIcons/icons8-json-white-96.png"

function MarkdownButton({
  fileId,
  isMarkdownView,
  toggleMarkdownView,
}: {
  fileId: number
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
      <ToolbarIcon blackIcon={blackIcon} whiteIcon={whiteIcon} fileId={fileId} />
    </button>
  )
}

export default MarkdownButton
