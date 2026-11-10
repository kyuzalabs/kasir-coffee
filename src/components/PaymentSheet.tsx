import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { calcChange, calcTotals, formatRupiah } from '../lib/money'
import type { PaymentMethod } from '../types'

const E_WALLETS = ['GoPay', 'OVO', 'DANA', 'ShopeePay']

export default function PaymentSheet({ onClose }: { onClose: () => void }) {
  const cart = useStore((s) => s.cart)
  const settings = useStore((s) => s.settings)
  const checkout = useStore((s) => s.checkout)
  const pay = useStore((s) => s.pay)
  const setReceipt = useStore((s) => s.setReceipt)

  const total = useMemo(() => calcTotals(cart, settings).total, [cart, settings])

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [cash, setCash] = useState<number>(total)
  const [wallet, setWallet] = useState<string>(E_WALLETS[0])
  const [failed, setFailed] = useState(false)
  const [count, setCount] = useState(120)

  useEffect(() => {
    if (method !== 'qris') return
    setCount(120)
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [method])

  const change = method === 'cash' ? calcChange(cash, total) : 0
  const enough = method !== 'cash' || cash >= total

  const methodLabel =
    method === 'cash' ? 'Tunai' : method === 'qris' ? 'QRIS' : method === 'debit' ? 'Kartu Debit' : wallet

  const success = () => {
    const order = checkout()
    const payment = pay(order.id, method, methodLabel, cash)
    setReceipt({ order, payment })
  }

  const fail = () => setFailed(true)

  const next10k = Math.ceil(total / 10000) * 10000
  const next50k = Math.ceil(total / 50000) * 50000

  const methods: { id: PaymentMethod; label: string }[] = [
    { id: 'cash', label: '💵 Tunai' },
    { id: 'qris', label: '📱 QRIS' },
    { id: 'ewallet', label: '📲 E-Wallet' },
    { id: 'debit', label: '💳 Debit' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-5 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">Pembayaran</h2>
            <p className="text-sm text-ink-2">Total {formatRupiah(total)}</p>
          </div>
          <button onClick={onClose} className="text-xl text-ink-3">
            ✕
          </button>
        </div>

        {failed ? (
          <div className="py-6 text-center">
            <div className="text-4xl">❌</div>
            <h3 className="mt-2 font-serif text-lg font-semibold text-danger">Pembayaran Gagal</h3>
            <p className="text-sm text-ink-2">Silakan coba lagi atau pilih metode lain.</p>
            <button
              onClick={() => setFailed(false)}
              className="mt-4 w-full rounded-2xl bg-coffee py-3 font-semibold text-white"
            >
              Coba Lagi
            </button>
            <button onClick={onClose} className="mt-2 w-full rounded-2xl border border-line py-3 text-sm font-medium text-ink-2">
              Kembali ke Kasir
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    method === m.id ? 'border-coffee bg-coffee-soft text-coffee' : 'border-line bg-white text-ink-2'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === 'cash' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-2">Uang diterima</label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(Number(e.target.value))}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-lg font-semibold outline-none transition focus:border-coffee"
                />
                <div className="mt-2 flex gap-2">
                  <QuickBtn label="Uang pas" onClick={() => setCash(total)} />
                  <QuickBtn label={formatRupiah(next10k)} onClick={() => setCash(next10k)} />
                  <QuickBtn label={formatRupiah(next50k)} onClick={() => setCash(next50k)} />
                </div>
                <div className="mt-3 flex justify-between rounded-xl bg-cream-2 px-4 py-3 text-sm">
                  <span className="text-ink-2">Kembalian</span>
                  <span className="font-semibold text-coffee">{formatRupiah(change)}</span>
                </div>
              </div>
            )}

            {method === 'qris' && (
              <div className="text-center">
                <div className="mx-auto grid h-44 w-44 place-items-center rounded-2xl border-2 border-dashed border-line bg-white">
                  <div className="text-center">
                    <div className="text-4xl">👛</div>
                    <p className="mt-1 text-xs font-semibold text-coffee">QRIS</p>
                    <p className="text-[10px] text-ink-3">kode QR demo</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-2">Berlaku hingga 02:{String(count % 60).padStart(2, '0')}</p>
                <button onClick={success} className="mt-3 w-full rounded-2xl bg-coffee py-3 font-semibold text-white">
                  Simulasikan Pembayaran Berhasil
                </button>
              </div>
            )}

            {method === 'ewallet' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-2">Pilih wallet</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {E_WALLETS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWallet(w)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                        wallet === w ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-ink-2'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <p className="mb-3 rounded-xl bg-cream-2 px-4 py-3 text-sm text-ink-2">
                  Minta pelanggan membuka {wallet} dan memindai / menyelesaikan pembayaran.
                </p>
                <button onClick={success} className="w-full rounded-2xl bg-coffee py-3 font-semibold text-white">
                  Simulasikan Berhasil
                </button>
                <button onClick={fail} className="mt-2 w-full rounded-2xl border border-line py-3 text-sm font-medium text-ink-2">
                  Simulasikan Gagal
                </button>
              </div>
            )}

            {method === 'debit' && (
              <div className="text-center">
                <div className="text-4xl">💳</div>
                <p className="mt-2 rounded-xl bg-cream-2 px-4 py-3 text-sm text-ink-2">
                  Gesek / tap kartu debit di mesin EDC, lalu konfirmasi.
                </p>
                <button onClick={success} className="mt-3 w-full rounded-2xl bg-coffee py-3 font-semibold text-white">
                  Simulasikan Berhasil
                </button>
                <button onClick={fail} className="mt-2 w-full rounded-2xl border border-line py-3 text-sm font-medium text-ink-2">
                  Simulasikan Gagal
                </button>
              </div>
            )}

            {method === 'cash' && (
              <button
                onClick={success}
                disabled={!enough}
                className="mt-4 w-full rounded-2xl bg-coffee py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enough ? `Bayar ${formatRupiah(total)}` : 'Uang kurang'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl border border-line bg-white px-2 py-2 text-xs font-medium text-ink-2 transition hover:border-coffee"
    >
      {label}
    </button>
  )
}