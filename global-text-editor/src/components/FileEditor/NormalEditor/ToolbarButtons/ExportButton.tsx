import { useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"
import DropdownOverlay from "../../../../shared/DropdownOverlay"
import ToolbarIcon from "./Components/ToolbarIcon"

import blackDownloadIcon from "assets/NormalTypeIcons/icons8-download-black-96.png"
import whiteDownloadIcon from "assets/NormalTypeIcons/icons8-download-white-96.png"

import blackMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-black-96.png"
import whiteMarkdownIcon from "assets/NormalTypeIcons/icons8-markdown-white-96.png"

import blackPdfIcon from "assets/NormalTypeIcons/icons8-pdf-black-96.png"
import whitePdfIcon from "assets/NormalTypeIcons/icons8-pdf-white-96.png"

function ExportButton({
  editor,
  themeColor,
}: {
  editor: Editor | null
  themeColor: themeColorType
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
        style={{
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <ToolbarIcon
          themeColor={themeColor}
          blackIcon={blackDownloadIcon}
          whiteIcon={whiteDownloadIcon}
        />
      </button>

      {/* Dropdown Options (explicit buttons + icons) */}
      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        themeColor={themeColor}
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
            themeColor={themeColor}
            blackIcon={blackMarkdownIcon}
            whiteIcon={whiteMarkdownIcon}
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
            themeColor={themeColor}
            blackIcon={blackPdfIcon}
            whiteIcon={whitePdfIcon}
          />
          <span>Export to PDF</span>
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default ExportButton
