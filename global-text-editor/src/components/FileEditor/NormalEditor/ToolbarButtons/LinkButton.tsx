import type { Editor } from "@tiptap/core"
import ToolbarIcon from "shared/ToolbarIcon"
import blackLinkIcon from "assets/NormalTypeIcons/icons8-attach-black-96.png"
import whiteLinkIcon from "assets/NormalTypeIcons/icons8-attach-white-96.png"


function LinkButton({ 
  editor,
  editorTheme
}: {
  editor: Editor | null
  editorTheme: "black" | "white"
}) {
  if (!editor) return null

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
    >
      <ToolbarIcon 
        blackIcon={blackLinkIcon}
        whiteIcon={whiteLinkIcon}
        editorTheme={editorTheme}
      />
    </button>
  )
}

export default LinkButton
