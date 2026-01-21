import { useState } from "react"
import type { Editor } from "@tiptap/core"
import type { themeColorType } from "../NormalEditor"

function FontSizeButton({
  editor,
  themeColor,
}: {
  editor: Editor | null
  themeColor: themeColorType
}) {
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
        padding: "2px 2px",
        borderRadius: 6,
        border:
          themeColor === "black"
            ? "1px solid rgba(255,255,255,0.20)"
            : "1px solid rgba(0,0,0,0.20)",
        background: "transparent",
        color: themeColor === "black" ? "rgba(255,255,255,0.90)" : "rgba(0,0,0,0.90)",
      }}
    />
  )
}

export default FontSizeButton
