import { useState } from 'react'
import SidebarLayout from './Sidebar'
import type { SidebarItem } from './Sidebar'

const items: SidebarItem[] = [
  { id: 'notes', label: 'Notes' },
  { id: 'settings', label: 'Settings' }
]

export default function MainPage() {
  const [activeId, setActiveId] = useState<string>('notes')

  return (
    <SidebarLayout
      title="Electron Demo"
      items={items}
      activeId={activeId}
      onSelect={setActiveId}
    >
      {activeId === 'notes' ? <NotesPage /> : <SettingsPage />}
    </SidebarLayout>
  )
}

function NotesPage() {
  return <div className="text-sm">Notes page</div>
}

function SettingsPage() {
  return <div className="text-sm">Settings page</div>
}
