import { useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"

import blackDownloadIcon from "assets/NormalTypeIcons/icons8-download-black-96.png"
import whiteDownloadIcon from "assets/NormalTypeIcons/icons8-download-white-96.png"

import blackMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-black-96.png"
import whiteMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-white-96.png"

import blackPdfIcon from "assets/NormalTypeIcons/icons8-pdf-black-96.png"
import whitePdfIcon from "assets/NormalTypeIcons/icons8-pdf-white-96.png"

function ExportButton({
  editor,
}: {
  editor: Editor | null
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  if (!editor) return null

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Toolbar Button */}
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen((v) => !v)
        }}
      >
        <ToolbarIcon
          blackIcon={blackDownloadIcon}
          whiteIcon={whiteDownloadIcon}
        />
      </button>

      {/* Dropdown Options (explicit buttons + icons) */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        align="right"
      >
        {/* Markdown */}
        <button
          type="button"
          onMouseDown={async () => {
            const md = editor.getMarkdown()
            try {
              await navigator.clipboard.writeText(md)
            } catch {
              window.prompt("Copy Markdown:", md)
            }
          }}
        >
          <ToolbarIcon
            blackIcon={blackMarkdownIcon}
            whiteIcon={whiteMarkdownIcon}
            onlyBlackIcon={true}
          />
          <span>Export to markdown</span>
        </button>
        {/* PDF */}
        <button
          type="button"
          onMouseDown={async () => {
            const res = await window.api.exportToPDF()
            if (!res.ok || res.canceled) return
            window.alert(`Saved PDF: ${res.filePath}`)
          }}
        >
          <ToolbarIcon
            blackIcon={blackPdfIcon}
            whiteIcon={whitePdfIcon}
            onlyBlackIcon={true}
          />
          <span>Export to PDF</span>
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default ExportButton
