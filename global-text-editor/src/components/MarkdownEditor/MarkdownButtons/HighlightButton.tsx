import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-black-96.png"
import whiteHighlightIcon from "assets/NormalTypeIcons/icons8-highlight-white-96.png"

const COLORS = [
  "#f59e0b", // orange
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ef4444", // red
]

function HighlightButton({
  editor,
  fileId,
  isMarkdownView,
  markdownText,
  onChangeMarkdown,
  textareaRef,
}: {
  editor: Editor | null
  fileId: number
  isMarkdownView: boolean
  markdownText: string
  onChangeMarkdown: (next: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      if (!rootRef.current?.contains(el)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [open])

  function applyColorMarkdown(color: string) {
    const ta = textareaRef.current
    if (!ta) return

    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0

    const before = markdownText.slice(0, start)
    const selected = markdownText.slice(start, end)
    const after = markdownText.slice(end)

    const openMatch = before.match(/<span style="color:([^"]+)">$/)
    const hasClose = after.startsWith("</span>")

    // If selection is already wrapped, replace the OPEN tag color
    if (openMatch && hasClose) {
      const oldOpenLen = openMatch[0].length
      const newOpen = `<span style="color:${color}">`

      const next = before.slice(0, -oldOpenLen) + newOpen + selected + after
      onChangeMarkdown(next)

      requestAnimationFrame(() => {
        ta.focus()
        const delta = newOpen.length - oldOpenLen
        ta.setSelectionRange(start + delta, end + delta)
      })
      return
    }

    // Otherwise wrap selection (also works if selection is empty)
    const openTag = `<span style="color:${color}">`
    const closeTag = `</span>`
    const next = before + openTag + selected + closeTag + after
    onChangeMarkdown(next)

    requestAnimationFrame(() => {
      ta.focus()
      const caretStart = start + openTag.length
      ta.setSelectionRange(caretStart, caretStart + selected.length)
    })
  }

  function applyColorJson(color: string) {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
  }

  function applyColor(color: string) {
    if (isMarkdownView) applyColorMarkdown(color)
    else applyColorJson(color)
    setOpen(false)
  }

  if (!editor) return null

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        tabIndex={-1}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        <ToolbarIcon blackIcon={blackHighlightIcon} whiteIcon={whiteHighlightIcon} fileId={fileId} />
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 9999,
            padding: 8,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(20,20,20,0.98)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 18px)",
            gap: 8,
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // don't steal focus / selection
                applyColor(c)
              }}
              title={c}
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: c,
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default HighlightButton
