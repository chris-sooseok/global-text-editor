import { TextStyle } from "@tiptap/extension-text-style"
import type { JSONContent } from "@tiptap/core"

// custom function
const TextStyleMarkdown = TextStyle.extend({
  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node.content || [])
    const color = node.attrs?.color

    if (!color) return content
    return `<span style="color:${color}">${content}</span>`
  },
})

export default TextStyleMarkdown

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