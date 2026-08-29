# Easy Markdown

A cross-platform desktop notes app with a rich Markdown editor. The application code is in
[`global-text-editor/`](global-text-editor/).

Documents are not stored as loose files on disk. Every file and folder is a UUID-keyed record in a
local database, which keeps the tree independent of any real filesystem layout and is intended to
make cross-device sync and features like "export to PDF" straightforward to add later.

> Status: early development.

### Tech stack

- **Electron** — desktop shell; the main process owns the database and filesystem access.
- **React 19 + TypeScript + Vite** — renderer.
- **Tailwind CSS v4** for styling.
- **Tiptap v3** as the rich-text / Markdown editor.
- **SQLite** (via `better-sqlite3`) with SQL migrations for persistence.

### Architecture

```
global-text-editor/
  electron/
    main.cjs  preload.cjs      # app bootstrap + context bridge
    db/
      index.cjs
      migrations/              # 001 fsNode tree, 002 fileConfig
    ipc/                       # editor + filesystem-node IPC handlers
  src/
    components/
      MarkdownEditor/          # Tiptap editor + formatting toolbar
      Sidebar/                 # file/folder tree
      Tab/                     # open-document tabs
    store/
      FsTreeStore/             # virtual file tree state
      TabManagerStore/         # open tabs state
      EditorContentStore/      # editor content + sync bus
    pages/  shared/
```

The renderer never touches the disk directly: it calls typed IPC methods exposed through
`preload.cjs`, and the Electron main process performs the actual database and file operations.

The editor toolbar covers bold, italic, underline, strikethrough, headings, lists, links, images,
code and code blocks, block quotes, highlight, super/subscript, text alignment, theme switching,
undo/redo, and export.

### Getting started

Prerequisites: Node.js and npm.

```bash
cd global-text-editor
npm install
npm run dev        # Vite renderer + Electron, concurrently
```

### Building

```bash
npm run build          # renderer build
npm run dist:mac       # packaged .dmg (arm64) via electron-builder
```
