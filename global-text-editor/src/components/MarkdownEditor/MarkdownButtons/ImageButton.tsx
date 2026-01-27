import { useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import DropdownOverlay from "shared/DropdownOverlay"
import ToolbarIcon from "shared/ToolbarIcon"
import blackImageIcon from "assets/NormalTypeIcons/icons8-add-image-black-96.png"
import whiteImageIcon from "assets/NormalTypeIcons/icons8-add-image-white-96.png"

function ImageButton({
  editor,
  fileId,
  storagePath,
}: {
  editor: Editor | null
  fileId: number
  storagePath: string
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function uploadAndInsert(file: File) {
    if (!editor) return

    const fileContent = await file.arrayBuffer()
    const res = await window.api.saveImageAsset(storagePath, fileContent, file.name)
    if (!res.ok || !res.src) return

    editor.chain().focus().setImage({ src: res.src }).run()
  }

  function insertUrl() {
    if (!editor) {
      setDropdownIsOpen(false)
      return
    }

    const src = urlInput.trim()
    if (!src) return

    editor.chain().focus().setImage({ src }).run()
    setUrlInput("")
    setDropdownIsOpen(false)
  }

  if (!editor) return null

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdownIsOpen((v) => !v)
        }}
      >
        <ToolbarIcon blackIcon={blackImageIcon} whiteIcon={whiteImageIcon} fileId={fileId} />
      </button>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          if (!file) return
          void uploadAndInsert(file)
          e.currentTarget.value = ""
        }}
      />

      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        scrollable={false}
        align="center"
      >
        {/* URL input */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.currentTarget.value)}
            placeholder="Image URL"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                insertUrl()
              }
              if (e.key === "Escape") {
                e.preventDefault()
                setDropdownIsOpen(false)
              }
            }}
            style={{
              width: 220,
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
              insertUrl()
            }}
          >
            Insert
          </button>
        </div>

        {/* Upload */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            setDropdownIsOpen(false)
            fileInputRef.current?.click()
          }}
        >
          Upload…
        </button>
      </DropdownOverlay>
    </div>
  )
}

export default ImageButton
