import { useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import { DropdownOverlay } from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"

import blackDownloadIcon from "assets/NormalTypeIcons/icons8-download-black-96.png"
import whiteDownloadIcon from "assets/NormalTypeIcons/icons8-download-white-96.png"

import blackMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-black-96.png"
import whiteMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-white-96.png"

import blackPdfIcon from "assets/NormalTypeIcons/icons8-pdf-black-96.png"
import whitePdfIcon from "assets/NormalTypeIcons/icons8-pdf-white-96.png"

function ExportButton({
  editor,
  fileId
}: {
  editor: Editor
  fileId: number
}) {
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})


  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Toolbar Button */}
      <button
        tabIndex={-1}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
      >
        <ToolbarIcon
          blackIcon={blackDownloadIcon}
          whiteIcon={whiteDownloadIcon}
          fileId={fileId}
        />
      </button>

      {/* Dropdown Options (explicit buttons + icons) */}
      <DropdownOverlay
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        align="left"
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        {/* Markdown */}
        <button
          tabIndex={-1}
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
          tabIndex={-1}
          type="button"
          onMouseDown={async () => {
            // const res = await window.api.exportToPDF()
            // if (!res.ok || res.canceled) return
            // window.alert(`Saved PDF: ${res.filePath}`)
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
