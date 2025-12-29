import { useState } from 'react'

export type SidebarItem = {
  id: string
  label: string
}

type Props = {
  title?: string
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  children: React.ReactNode
}

export default function SidebarLayout({
  title = 'Menu',
  items,
  activeId,
  onSelect,
  children
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={[
          'border-r border-black/10 p-3 flex flex-col gap-3',
          collapsed ? 'w-14' : 'w-60'
        ].join(' ')}
      >
        <div className={['flex items-center gap-2', collapsed ? 'justify-center' : 'justify-between'].join(' ')}>
          <p className={['text-sm font-semibold', collapsed ? 'hidden' : 'block'].join(' ')}>
            {title}
          </p>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg border border-black/20 px-2 py-1 text-sm hover:bg-black/5"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {items.map((it) => {
            const active = it.id === activeId
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelect(it.id)}
                title={it.label}
                className={[
                  'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                  'border-black/10 hover:bg-black/5',
                  active ? 'bg-black/10' : 'bg-transparent',
                  collapsed ? 'px-0 text-center' : ''
                ].join(' ')}
              >
                {collapsed ? it.label.slice(0, 1) : it.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  )
}
