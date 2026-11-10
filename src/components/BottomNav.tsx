import type { Page } from '../App'

const items: { key: Page; label: string; icon: string }[] = [
  { key: 'kasir', label: 'Kasir', icon: '☕' },
  { key: 'riwayat', label: 'Riwayat', icon: '🧾' },
  { key: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
]

export default function BottomNav({
  page,
  onChange,
}: {
  page: Page
  onChange: (p: Page) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch gap-1 px-2 py-1.5">
        {items.map((it) => {
          const active = page === it.key
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-medium transition ${
                active ? 'bg-coffee-soft text-coffee' : 'text-ink-3'
              }`}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}