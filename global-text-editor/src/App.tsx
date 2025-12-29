import { useEffect, useState } from 'react'

type Note = { id: number; text: string; createdAt: number }

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [text, setText] = useState('')

  async function refresh() {
    setNotes(await window.db.listNotes())
  }

  useEffect(() => {
    refresh()
  }, [])

  async function add() {
    const t = text.trim()
    if (!t) return
    await window.db.addNote(t)
    setText('')
    await refresh()
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Electron + SQLite Notes</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a note…"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={add} style={{ padding: '8px 12px' }}>
          Add
        </button>
      </div>

      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            {n.text}{' '}
            <small style={{ opacity: 0.6 }}>
              ({new Date(n.createdAt).toLocaleString()})
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}
