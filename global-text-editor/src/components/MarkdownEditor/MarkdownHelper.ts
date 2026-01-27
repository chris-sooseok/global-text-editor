import { TextStyle } from "@tiptap/extension-text-style"

const TextStyleMarkdown = TextStyle.extend({
  renderMarkdown: (node, helpers) => {
    const content = helpers.renderChildren(node.content || [])
    const color = node.attrs?.color

    if (!color) return content
    return `<span style="color:${color}">${content}</span>`
  },
})

export default TextStyleMarkdown