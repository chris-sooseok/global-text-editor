# Easy Markdown — application

This directory contains the full application. See the [repository README](../README.md) for the
project overview, architecture, and design notes.

## Quick start

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev        # Vite renderer + Electron, run concurrently
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Vite dev server and Electron together |
| `npm run build` | Build the renderer |
| `npm run build:prod` | Build the renderer with the production Vite config |
| `npm run dist:mac` | Package a macOS `.dmg` (arm64) via electron-builder |

## Layout

```
electron/        # main process: app bootstrap, SQLite database, IPC handlers
  db/migrations/ # schema migrations (fsNode tree, fileConfig)
  ipc/           # editor + filesystem-node IPC
src/             # React + TypeScript renderer
  components/    # MarkdownEditor (Tiptap), Sidebar, Tab
  store/         # FsTreeStore, TabManagerStore, EditorContentStore
```
