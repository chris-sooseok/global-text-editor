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

  const markdownIcon = themeColor === "black" ? whiteMarkdownIcon : blackMarkdownIcon
  const pdfIcon = themeColor === "black" ? whitePdfIcon : blackPdfIcon

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Toolbar Button */}
      <button
        ref={btnRef}
        type="button"
        aria-label="Export"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen((v) => !v)
        }}
        style={{
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
        }}
        aria-haspopup="menu"
        aria-expanded={dropdownIsOpen}
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
        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            const md = editor.getMarkdown()
            setDropdownIsOpen(false)

            void (async () => {
              try {
                await navigator.clipboard.writeText(md)
              } catch {
                window.prompt("Copy Markdown:", md)
              }
            })()
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 8,
            background: "transparent",
          }}
        >
          <img src={markdownIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
          <span>Copy Markdown</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onMouseDown={(e) => {
            e.preventDefault()
            setDropdownIsOpen(false)

            void (async () => {
              const res = await window.api.exportToPDF()
              if (!res.ok || res.canceled) return
              window.alert(`Saved PDF: ${res.filePath}`)
            })()
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            whiteSpace: "nowrap",
            padding: "6px 10px",
            borderRadius: 8,
            background: "transparent",
          }}
        >
          <img src={pdfIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16 }} />
          <span>Save PDF</span>
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default ExportButton
