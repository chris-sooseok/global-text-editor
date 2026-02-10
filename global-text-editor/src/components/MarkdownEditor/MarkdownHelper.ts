import { TextStyle } from "@tiptap/extension-text-style"
import type { JSONContent } from "@tiptap/core"
import { Extension } from "@tiptap/core"

// custom function
export const TextStyleMarkdown = TextStyle.extend({
  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node.content || [])
    const color = node.attrs?.color

    if (!color) return content
    return `<span style="color:${color}">${content}</span>`
  },
})


export function makeDefaultDocTemplate(title: string): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: title }],
      },
      { type: "paragraph" },
    ],
  }
}

export const TabIndent = Extension.create({
  name: "tabIndent",
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // If you're inside a list item, indent the list item (nested list)
        const didSink = this.editor.commands.sinkListItem("listItem")
        if (didSink) return true

        // Otherwise insert a literal tab character
        this.editor.commands.insertContent("\t")
        return true
      },

      "Shift-Tab": () => {
        // If you're inside a list item, outdent
        const didLift = this.editor.commands.liftListItem("listItem")
        if (didLift) return true

        // Prevent focus from jumping to toolbar buttons
        return true
      },
    }
  },
})
