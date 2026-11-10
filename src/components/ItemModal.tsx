import { useState } from 'react'
import type { Addon, MenuItem, SelectedVariant } from '../types'
import { useStore } from '../store/useStore'
import { formatRupiah } from '../lib/money'

export default function ItemModal({
  item,
  onClose,
}: {
  item: MenuItem
  onClose: () => void
}) {
  const addToCart = useStore((s) => s.addToCart)

  const [selectedVars, setSelectedVars] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const g of item.variants) init[g.id] = g.options[0].id
    return init
  })
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [qty, setQty] = useState(1)

  const builtVariants: SelectedVariant[] = item.variants.map((g) => {
    const opt = g.options.find((o) => o.id === selectedVars[g.id]) || g.options[0]
    return {
      groupId: g.id,
      groupLabel: g.label,
      optionId: opt.id,
      optionLabel: opt.label,
      price: opt.price,
    }
  })

  const addons: Addon[] = item.addons.filter((a) => selectedAddons.includes(a.id))
  const unitPrice =
    item.price +
    builtVariants.reduce((s, v) => s + v.price, 0) +
    addons.reduce((s, a) => s + a.price, 0)

  const confirm = () => {
    addToCart(item, builtVariants, addons, qty, note.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-5 sm:rounded-3xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">{item.name}</h2>
            <p className="text-sm text-ink-2">mulai {formatRupiah(item.price)}</p>
          </div>
          <button onClick={onClose} className="text-xl text-ink-3">
            ✕
          </button>
        </div>

        {item.variants.map((g) => (
          <div key={g.id} className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-ink-2">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedVars((s) => ({ ...s, [g.id]: o.id }))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    selectedVars[g.id] === o.id
                      ? 'border-coffee bg-coffee text-white'
                      : 'border-line bg-white text-ink-2'
                  }`}
                >
                  {o.label}
                  {o.price > 0 ? ' +' + formatRupiah(o.price) : ''}
                </button>
              ))}
            </div>
          </div>
        ))}

        {item.addons.length > 0 && (
          <div className="mb-4">
            <p className="mb-1.5 text-sm font-medium text-ink-2">Tambahan</p>
            <div className="flex flex-wrap gap-2">
              {item.addons.map((a) => {
                const on = selectedAddons.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() =>
                      setSelectedAddons((s) =>
                        on ? s.filter((x) => x !== a.id) : [...s, a.id],
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      on ? 'border-coffee bg-coffee-soft text-coffee' : 'border-line bg-white text-ink-2'
                    }`}
                  >
                    {a.label} +{formatRupiah(a.price)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-ink-2">Catatan</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="contoh: less ice"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-coffee"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-9 w-9 rounded-full border border-line text-lg leading-none"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="h-9 w-9 rounded-full border border-line text-lg leading-none"
            >
              +
            </button>
          </div>
          <p className="font-serif text-xl font-semibold text-coffee">{formatRupiah(unitPrice * qty)}</p>
        </div>

        <button
          onClick={confirm}
          className="w-full rounded-2xl bg-coffee py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99]"
        >
          Tambah ke Pesanan
        </button>
      </div>
    </div>
  )
}