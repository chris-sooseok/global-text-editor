
### Tiptap editor mount strategy
Tiptap editor will be first mounted when a file that requires the editor is selected. Once the editor is mounted, the instance will be kept in the `Tab` until the `Tab` gets to be un-mounted. Thus, `Tab` doesn't have to re-mount and un-mount every time when some file requires the editor. This decision is made since mounting Tiptap editor is expensive.

> Also, consider later caching the file content, which makes loading file content also faster.

### One fileContent at a time
`Tab` will display only the file content of the active file. Switching between files will require having to load the metadata of files

### Cost of mounting `Tab`
What is expensive of mounting `Tab` is when Tiptap editor is required. Multiple tabs that keep Tiptap editor is doable. However, un-mounting and re-mounting tab that requires Tiptap editor will be expensive. `TabId` helps re-rendering existing tabs that already have Tiptap editor mounted.
