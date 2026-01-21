import type { Editor } from "@tiptap/core"

import blackLinkIcon from "assets/NormalTypeIcons/icons8-attach-black-96.png"
import whiteLinkIcon from "assets/NormalTypeIcons/icons8-attach-white-96.png"


function LinkButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const isActive = editor.isActive("link")

  return (
    <button
      type="button"
      aria-label="Link"
      onMouseDown={(e) => {
        e.preventDefault()

        // If cursor/selection is already in a link, clicking removes the link
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run()
          return
        }

        const currentHref = editor.getAttributes("link")?.href as string | undefined
        const href = window.prompt("Enter URL", currentHref ?? "")

        // user cancelled prompt
        if (href === null) return

        // empty -> no link
        if (href.trim() === "") {
          editor.chain().focus().unsetLink().run()
          return
        }

        editor
          .chain()
          .focus()
          // extendMarkRange makes sure the whole link mark is targeted (not just 1 char)
          .extendMarkRange("link")
          .setLink({ href: href.trim() })
          .run()
      }}
      style={{
        background: isActive ? "rgba(67, 102, 158, 0.18)" : "rgba(255,255,255,0.05)",
      }}
    >
      🔗
    </button>
  )
}

export default LinkButton
