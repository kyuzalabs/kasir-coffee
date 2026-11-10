import { useStore } from '../store/useStore'
import { calcTotals, formatRupiah } from '../lib/money'

export default function CartPanel({ onPay }: { onPay: () => void }) {
  const cart = useStore((s) => s.cart)
  const settings = useStore((s) => s.settings)
  const orderType = useStore((s) => s.orderType)
  const tableName = useStore((s) => s.tableName)
  const customerName = useStore((s) => s.customerName)
  const setOrderMeta = useStore((s) => s.setOrderMeta)
  const incItem = useStore((s) => s.incItem)
  const decItem = useStore((s) => s.decItem)
  const removeItem = useStore((s) => s.removeItem)

  const totals = calcTotals(cart, settings)

  if (cart.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 text-center">
        <div className="text-3xl">🛒</div>
        <p className="mt-2 text-sm text-ink-2">Keranjang masih kosong.</p>
        <p className="text-xs text-ink-3">Tap menu untuk mulai pesanan.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-serif text-lg font-semibold">Pesanan</h2>

      <div className="mb-3 flex flex-col gap-2">
        {cart.map((c) => {
          const meta = [
            c.variants.map((v) => v.optionLabel).join(' · '),
            c.addons.map((a) => a.label).join(' + '),
          ]
            .filter(Boolean)
            .join(' · ')
          return (
            <div key={c.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                {meta && <p className="truncate text-xs text-ink-2">{meta}</p>}
                {c.note && <p className="truncate text-xs italic text-ink-2">"{c.note}"</p>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => decItem(c.id)}
                  className="h-7 w-7 rounded-full border border-line text-sm leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">{c.qty}</span>
                <button
                  onClick={() => incItem(c.id)}
                  className="h-7 w-7 rounded-full border border-line text-sm leading-none"
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right text-sm font-semibold">
                {formatRupiah(c.unitPrice * c.qty)}
              </span>
              <button onClick={() => removeItem(c.id)} className="text-ink-3" aria-label="Hapus">
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setOrderMeta({ orderType: 'dine-in' })}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            orderType === 'dine-in' ? 'border-coffee bg-coffee-soft text-coffee' : 'border-line bg-white text-ink-2'
          }`}
        >
          🍽️ Dine-in
        </button>
        <button
          onClick={() => setOrderMeta({ orderType: 'takeaway' })}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            orderType === 'takeaway' ? 'border-coffee bg-coffee-soft text-coffee' : 'border-line bg-white text-ink-2'
          }`}
        >
          🥡 Take-away
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <input
          value={tableName}
          onChange={(e) => setOrderMeta({ tableName: e.target.value })}
          placeholder="No. meja (opsional)"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-coffee"
        />
        <input
          value={customerName}
          onChange={(e) => setOrderMeta({ customerName: e.target.value })}
          placeholder="Nama pelanggan"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-coffee"
        />
      </div>

      <div className="space-y-1 border-t border-dashed border-line pt-3 text-sm">
        <div className="flex justify-between text-ink-2">
          <span>Subtotal</span>
          <span>{formatRupiah(totals.subtotal)}</span>
        </div>
        {totals.tax > 0 && (
          <div className="flex justify-between text-ink-2">
            <span>PPN {settings.taxPercent}%</span>
            <span>{formatRupiah(totals.tax)}</span>
          </div>
        )}
        {totals.discount > 0 && (
          <div className="flex justify-between text-danger">
            <span>Diskon</span>
            <span>-{formatRupiah(totals.discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 text-base font-bold">
          <span>Total</span>
          <span className="font-serif text-lg text-coffee">{formatRupiah(totals.total)}</span>
        </div>
      </div>

      <button
        onClick={onPay}
        className="mt-4 w-full rounded-2xl bg-coffee py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99]"
      >
        Bayar · {formatRupiah(totals.total)}
      </button>
    </div>
  )
}