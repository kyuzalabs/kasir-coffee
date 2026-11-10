import type { MenuItem } from '../types'
import { formatRupiah } from '../lib/money'

export default function MenuItemCard({
  item,
  onClick,
}: {
  item: MenuItem
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!item.isAvailable}
      className="flex flex-col items-start gap-0.5 rounded-2xl border border-line bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="text-3xl leading-none">{item.emoji || '☕'}</span>
      <span className="mt-1.5 text-sm font-semibold leading-tight text-ink">{item.name}</span>
      <span className="text-sm font-bold text-coffee">{formatRupiah(item.price)}</span>
      {!item.isAvailable && <span className="text-xs font-medium text-danger">Habis</span>}
    </button>
  )
}