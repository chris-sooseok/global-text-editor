import { useRef, useState } from "react"
import { DropdownOverlay } from "shared/DropdownOverlay"
import blackImageIcon from "assets/NormalTypeIcons/icons8-add-image-black-96.png"
import whiteImageIcon from "assets/NormalTypeIcons/icons8-add-image-white-96.png"
import EditorIcon from "shared/EditorIcon"
import { useMarkdownEditorContext } from "context/EditorContext"

function ImageButton({storagePath}: {storagePath: string}) {

  const { editor } = useMarkdownEditorContext()
  const [dropdown, setDropdown] = useState({ open: false, x: 0, y: 0})
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
      setDropdown({ open: false, x: 0, y: 0 })
      return
    }

    const src = urlInput.trim()
    if (!src) return

    editor.chain().focus().setImage({ src }).run()
    setUrlInput("")
    setDropdown({ open: false, x: 0, y: 0 })
  }

  if (!editor) return null

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setDropdown({ open: true, x: e.clientX, y: e.clientY })
        }}
      >
        <EditorIcon blackIcon={blackImageIcon} whiteIcon={whiteImageIcon} />
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
        open={dropdown.open}
        x={dropdown.x}
        y={dropdown.y}
        onClose={() => setDropdown({ open: false, x: 0, y: 0 }) }
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
                setDropdown({ open: false, x: 0, y: 0 })
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
            setDropdown({ open: false, x: 0, y: 0 })
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
