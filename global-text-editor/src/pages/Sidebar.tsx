import { useEffect, useMemo, useState } from 'react'

type Folder = {
  id: number
  parentId: number | null
  name: string
  createdAt: number
  updatedAt: number
}

export default function Sidebar() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)

  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function loadFolders() {
    const res = await window.api.listFolders()
    if (!res.ok) {
      console.error(res.message)
      return
    }
    setFolders(res.folders)
  }

  useEffect(() => {
    loadFolders()
  }, [])

  // Build parentId -> children[] map, so we can render a tree easily.
  const childrenByParent = useMemo(() => {
    const m = new Map<number | null, Folder[]>()

    for (const f of folders) {
      const key = f.parentId
      const arr = m.get(key) ?? []
      arr.push(f)
      m.set(key, arr)
    }

    // sort children by name (optional, but makes UI stable)
    for (const [, arr] of m) {
      arr.sort((a, b) => a.name.localeCompare(b.name))
    }

    return m
  }, [folders])

  function handleCreateFolder() {
    setIsCreatingFolder(true)
    setFolderName('')
    setError(null)
  }

  async function submitCreateFolder() {
    const name = folderName.trim()
    if (!name) {
      setError('Folder name is required.')
      return
    }

    setBusy(true)
    setError(null)

    try {
      // parent = selected folder; if none selected -> root (null)
      const res = await window.api.createFolder(name, selectedFolderId)

      if (!res.ok) {
        setError(res.message)
        return
      }

      setIsCreatingFolder(false)
      setFolderName('')

      // refresh folders so the new one appears
      await loadFolders()

      // auto-expand the parent so you can see the new folder immediately
      if (selectedFolderId !== null) {
        setExpanded((prev) => {
          const next = new Set(prev)
          next.add(selectedFolderId)
          return next
        })
      }
    } finally {
      setBusy(false)
    }
  }

  function toggleFolder(folderId: number) {
    setSelectedFolderId(folderId)

    setExpanded((prev) => {
      const next = new Set(prev) // copy so React sees a new object
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  function renderFolderNode(folder: Folder, depth: number) {
    const isSelected = folder.id === selectedFolderId
    const isOpen = expanded.has(folder.id)
    const children = childrenByParent.get(folder.id) ?? []

    return (
      <div key={folder.id}>
        <button
          type="button"
          onClick={() => toggleFolder(folder.id)}
          className={[
            'w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5',
            isSelected ? 'bg-black/10' : ''
          ].join(' ')}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          <span className="mr-2 text-black/50">
            {children.length > 0 ? (isOpen ? '▾' : '▸') : '•'}
          </span>
          {folder.name}
        </button>

        {isOpen && children.length > 0 && (
          <div>
            {children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootFolders = childrenByParent.get(null) ?? []

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-col border-r border-black/10">
        <div className="flex h-12 items-center justify-end border-b border-black/10 px-3">
          <button
            type="button"
            onClick={handleCreateFolder}
            className="rounded-lg border border-black/20 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Create Folder
          </button>
        </div>

        {isCreatingFolder && (
          <div className="border-b border-black/10 p-3">
            <div className="mb-2 text-xs text-black/60">
              Parent:{' '}
              <span className="font-semibold">
                {selectedFolderId === null
                  ? 'Root'
                  : folders.find((f) => f.id === selectedFolderId)?.name ?? `#${selectedFolderId}`}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full rounded-lg border border-black/20 px-3 py-2 text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCreateFolder()
                  if (e.key === 'Escape') {
                    setIsCreatingFolder(false)
                    setFolderName('')
                    setError(null)
                  }
                }}
              />

              <button
                type="button"
                onClick={submitCreateFolder}
                disabled={busy}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
              >
                Create
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        )}

        {/* Folder tree */}
        <div className="flex-1 overflow-auto p-2">
          {rootFolders.length === 0 ? (
            <div className="p-2 text-sm text-black/50">No folders yet.</div>
          ) : (
            rootFolders.map((f) => renderFolderNode(f, 0))
          )}
        </div>
      </aside>
    </div>
  )
}
