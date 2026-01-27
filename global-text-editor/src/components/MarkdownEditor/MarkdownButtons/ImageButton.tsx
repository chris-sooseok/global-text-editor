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
  if (!editor) return null

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function uploadAndInsert(file: File) {
    if (!editor) return

    const fileContent = await file.arrayBuffer()

    const res = await window.api.saveImageAsset(storagePath, fileContent, file.name)
    if (!res.ok || !res.src) return

    editor.chain().focus().setImage({ src: res.src }).run()
  }

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
          e.currentTarget.value = "" // allow re-upload same file
        }}
      />

      <DropdownOverlay
        dropdownIsOpen={dropdownIsOpen}
        setDropdownIsOpen={() => setDropdownIsOpen(false)}
        parentRef={btnRef}
        scrollable={false}
        align="center"
      >
        {/* URL */}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            const src = window.prompt("Image URL")
            if (!src) return
            editor.chain().focus().setImage({ src: src.trim() }).run()
            setDropdownIsOpen(false)
          }}
        >
          Image URL
        </button>

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
