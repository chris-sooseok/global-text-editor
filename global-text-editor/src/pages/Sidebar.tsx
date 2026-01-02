import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Folder } from 'types'

export default function Sidebar() {
  const [folders, setFolders] = useState<Folder[]>([])

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

    console.log(m);

    return m
  }, [folders])

  console.log(childrenByParent)


  function parseNullableId(input: string | null): number | null {
    // If user cancels or leaves it empty, treat as root (null)
    if (input == null) return null
    const s = input.trim()
    if (s === '' || s.toLowerCase() === 'null') return null

    // Convert to number; reject non-integers
    const n = Number(s)
    if (!Number.isInteger(n)) return NaN
    return n
  }

  const handleCreateFolder = useCallback(async () => {

      const name = window.prompt('Folder Name?')
      if (!name) return

      const parentIdInput = window.prompt('id')
      var parentId: number | null
      if (parentIdInput === '') {
        parentId = null
      } else {
        parentId = Number(parentIdInput)
      }
      
      const res = await window.api.createFolder(name, parentId)
  
      if (res.ok) {
        console.log(`${name} is created`)
      }
  }, [])

  const handleCreateFile = useCallback(async () => {

    const name = window.prompt('File Name?')
    if (!name) return

    const parentIdInput = window.prompt('id')
    var parentId: number | null

    if (parentIdInput === '') {
        parentId = null
    } else {
      parentId = Number(parentIdInput)
    }

    const res = await window.api.createFile(name, parentId)

    if (res.ok) {
      console.log(`${name} is created`)
    }

  }, [])

    return (
    <aside style={{ padding: 12, display: 'flex', gap: 8 }}>
      <button type="button" onClick={handleCreateFolder}>
        + Folder
      </button>

      <button type="button" onClick={handleCreateFile}>
        + File
      </button>
    </aside>
  )
}
