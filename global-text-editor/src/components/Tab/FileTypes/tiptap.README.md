

# ProseMirror
ProseMirror is like the "editor brain" and is a set of JS libraries that provide:
1. a document model (schema)
- your content is a tree of nodes that you can represent as JSON
2. editor state + transactions
- every change (insert text, delete, etc) is represented as a "transaction". This makes undo/redo and plugins reliable
3. DOM editing + selection
- hadnle cursor movement, clipboard behavior, and text selection. This is extremely hard to get right without ProseMirror
4. Plugins + commands
- keybindings, input, paste rules
- Rules like "pressing enter in a list item creates a new list item"

# Tiptap
Tiptap is not its own editor engine. Tiptap is basically
- ProseMirror, but with a simpler API
- extension-first design so you can add nodes/marks easily
- good react integration

So when you use Tiptap, the actual editing behaivor is ProseMirror, and your extensions become ProseMirror schema + plugins under the hood


# Tiptap Custom nodes
tiptap supports custom nodes which you can define for drawing snippet, image, diagram, and etc. This provides 
