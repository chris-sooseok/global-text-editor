import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import { DropdownOverlay } from "shared/DropdownOverlay"
import Icon from "shared/Icon"
import blackLinkIcon from "assets/NormalTypeIcons/icons8-attach-black-96.png"
import whiteLinkIcon from "assets/NormalTypeIcons/icons8-attach-white-96.png"
import EditorIcon from "shared/EditorIcon"
import { useMarkdownEditorContext } from "context/EditorContext"

function LinkButton() {
  const { editor } = useMarkdownEditorContext()
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
  const [href, setHref] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!dropdown) return
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [dropdown])

  if (!editor) return null

  function applyHref() {
    if (!editor) {
      setDropdown({ open: false, x: 0, y: 0 })
      return
    }

    const trimmed = href.trim()

    if (trimmed === "") {
      editor.chain().focus().unsetLink().run()
      setDropdown({ open: false, x: 0, y: 0 })
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run()

    setDropdown({ open: false, x: 0, y: 0 })
  }

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        type="button"
        aria-label="Link"
        onMouseDown={(e) => {
          e.preventDefault()

          // same behavior you had: if currently in a link, remove it
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run()
            return
          }

          // open editor UI
          const currentHref = (editor.getAttributes("link")?.href as string | undefined) ?? ""
          setHref(currentHref)
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
      >
        <EditorIcon blackIcon={blackLinkIcon} whiteIcon={whiteLinkIcon} />
      </button>

      <DropdownOverlay
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={inputRef}
            value={href}
            placeholder="https://..."
            onChange={(e) => setHref(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyHref()
              }
              if (e.key === "Escape") {
                e.preventDefault()
                setDropdown({ open: false, x: 0, y: 0 })
              }
            }}
            style={{
              width: 240,
              background: "transparent",
              outline: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 6,
              padding: "6px 8px",
            }}
          />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              applyHref()
            }}
          >
            Apply
          </button>
        </div>
      </DropdownOverlay>
    </div>
  )
}

export default LinkButton
