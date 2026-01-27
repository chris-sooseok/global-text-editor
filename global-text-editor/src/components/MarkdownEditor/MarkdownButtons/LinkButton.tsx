import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import blackLinkIcon from "assets/NormalTypeIcons/icons8-attach-black-96.png"
import whiteLinkIcon from "assets/NormalTypeIcons/icons8-attach-white-96.png"

function LinkButton({
  editor,
  fileId,
}: {
  editor: Editor | null
  fileId: number
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [href, setHref] = useState("")
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!dropdownIsOpen) return
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [dropdownIsOpen])

  if (!editor) return null

  function applyHref() {
    const trimmed = href.trim()

    if (trimmed === "") {
      editor.chain().focus().unsetLink().run()
      setDropdownIsOpen(false)
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run()

    setDropdownIsOpen(false)
  }

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        ref={btnRef}
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
          setDropdownIsOpen(true)
        }}
      >
        <ToolbarIcon blackIcon={blackLinkIcon} whiteIcon={whiteLinkIcon} fileId={fileId} />
      </button>

      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        scrollable={false}
        align="center"
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
                setDropdownIsOpen(false)
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
