import { useState } from "react"
import type { Editor } from "@tiptap/core"
import { ThemeManagerStore } from "store/ThemeStore/ThemeManagerStore"

function FontSizeButton({
  editor,
}: {
  editor: Editor | null
}) {

  const editorTheme = ThemeManagerStore((s) => s.editorTheme)
  const [value, setValue] = useState("16")

  if (!editor) return null

  function apply() {
    const n = Number(value)
    if (!Number.isFinite(n) || n <= 0) return
    if (editor)

    editor.chain().focus().setMark("textStyle", { fontSize: `${n}px` }).run()
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="\d{1,2}"
      value={value}
      onChange={(e) => {
      // keep only digits, max 2 chars
        const next = e.target.value.replace(/\D/g, "").slice(0, 2)
        setValue(next)
      }}
      onBlur={apply}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          apply()
        }
      }}
      style={{
        width: 35,
        padding: "0px 2px",
        borderRadius: 6,
        border:
          editorTheme === "black"
            ? "1px solid rgba(255, 255, 255, 0.6)"
            : "1px solid rgba(0, 0, 0, 0.6)",
        background: "transparent",
        color: editorTheme === "black" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
      }}
    />
  )
}

export default FontSizeButton
