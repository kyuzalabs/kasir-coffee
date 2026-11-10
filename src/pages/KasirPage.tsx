import { useMemo, useState } from 'react'
import { categories } from '../data/seed'
import { useStore } from '../store/useStore'
import MenuItemCard from '../components/MenuItemCard'
import ItemModal from '../components/ItemModal'
import CartPanel from '../components/CartPanel'
import PaymentSheet from '../components/PaymentSheet'
import type { MenuItem } from '../types'

export default function KasirPage() {
  const menu = useStore((s) => s.menu)
  const cart = useStore((s) => s.cart)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showPay, setShowPay] = useState(false)

  const filtered = useMemo(
    () =>
      menu.filter((m) => {
        const matchCat = cat === 'all' || m.categoryId === cat
        const matchQ = !q || m.name.toLowerCase().includes(q.toLowerCase())
        return matchCat && matchQ
      }),
    [menu, cat, q],
  )

  const itemCount = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Cari menu..."
        className="mb-3 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-coffee"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <CatChip active={cat === 'all'} onClick={() => setCat('all')} label="Semua" />
        {categories.map((c) => (
          <CatChip
            key={c.id}
            active={cat === c.id}
            onClick={() => setCat(c.id)}
            label={`${c.emoji} ${c.name}`}
          />
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((m) => (
            <MenuItemCard key={m.id} item={m} onClick={() => setSelected(m)} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-ink-3">Menu tidak ditemukan.</p>
          )}
        </div>

        <div className="hidden lg:sticky lg:top-4 lg:block">
          <CartPanel onPay={() => setShowPay(true)} />
        </div>
      </div>

      {itemCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-coffee px-5 py-3.5 font-medium text-white shadow-lg lg:hidden"
        >
          <span className="font-semibold">{itemCount} item</span>
          <span>Lihat Keranjang →</span>
        </button>
      )}

      {selected && <ItemModal item={selected} onClose={() => setSelected(null)} />}

      {showCart && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-cream p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Keranjang</h2>
              <button onClick={() => setShowCart(false)} className="text-xl text-ink-3">
                ✕
              </button>
            </div>
            <CartPanel
              onPay={() => {
                setShowCart(false)
                setShowPay(true)
              }}
            />
          </div>
        </div>
      )}

      {showPay && <PaymentSheet onClose={() => setShowPay(false)} />}
    </div>
  )
}

function CatChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? 'bg-coffee text-white' : 'border border-line bg-white text-ink-2'
      }`}
    >
      {label}
    </button>
  )
}