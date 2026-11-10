import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { formatRupiah } from '../lib/money'
import { buildReceiptText, copyText, shareText } from '../lib/receipt'
import type { Order } from '../types'

type Range = 'today' | '7d' | 'month' | 'all'

const RANGES: { id: Range; label: string }[] = [
  { id: 'today', label: 'Hari ini' },
  { id: '7d', label: '7 hari' },
  { id: 'month', label: 'Bulan ini' },
  { id: 'all', label: 'Semua' },
]

function rangeStart(r: Range): number {
  const now = new Date()
  if (r === 'today') {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime()
  }
  if (r === '7d') return now.getTime() - 7 * 24 * 3600 * 1000
  if (r === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1); return d.getTime()
  }
  return 0
}

export default function RiwayatPage() {
  const orders = useStore((s) => s.orders)
  const payments = useStore((s) => s.payments)
  const settings = useStore((s) => s.settings)
  const [range, setRange] = useState<Range>('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [detail, setDetail] = useState<Order | null>(null)

  const methods = useMemo(() => {
    const s = new Set<string>()
    for (const o of orders) {
      const p = payments[o.id]
      if (p) s.add(p.method)
    }
    return Array.from(s)
  }, [orders, payments])

  const filtered = useMemo(() => {
    const start = rangeStart(range)
    return orders.filter((o) => {
      if (o.createdAt < start) return false
      if (methodFilter !== 'all') {
        const p = payments[o.id]
        if (!p || p.method !== methodFilter) return false
      }
      return true
    })
  }, [orders, payments, range, methodFilter])

  const summary = useMemo(() => {
    const totalSales = orders.reduce((s, o) => s + o.total, 0)
    const count = orders.length
    const byName = new Map<string, number>()
    for (const o of orders) {
      for (const it of o.items) {
        byName.set(it.name, (byName.get(it.name) || 0) + it.qty)
      }
    }
    const top = Array.from(byName.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    return { totalSales, count, top }
  }, [orders])

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="font-serif text-2xl font-semibold">Riwayat</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs text-ink-2">Total Penjualan</p>
          <p className="font-serif text-xl font-semibold text-coffee">{formatRupiah(summary.totalSales)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs text-ink-2">Jumlah Transaksi</p>
          <p className="font-serif text-xl font-semibold">{summary.count}</p>
        </div>
      </div>

      {summary.top.length > 0 && (
        <div className="mt-3 rounded-2xl border border-line bg-white p-4">
          <p className="mb-2 text-xs font-medium text-ink-2">Menu Terlaris</p>
          <div className="flex flex-wrap gap-2">
            {summary.top.map(([name, qty], i) => (
              <span key={name} className="rounded-full bg-coffee-soft px-3 py-1 text-xs text-coffee">
                {i + 1}. {name} ({qty}×)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              range === r.id ? 'bg-coffee text-white' : 'border border-line bg-white text-ink-2'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <select
        value={methodFilter}
        onChange={(e) => setMethodFilter(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none"
      >
        <option value="all">Semua metode</option>
        {methods.map((m) => (
          <option key={m} value={m}>
            {m === 'cash' ? 'Tunai' : m === 'qris' ? 'QRIS' : m === 'debit' ? 'Debit' : 'E-Wallet'}
          </option>
        ))}
      </select>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-3">Belum ada transaksi pada rentang ini.</p>
        )}
        {filtered.map((o) => {
          const p = payments[o.id]
          return (
            <button
              key={o.id}
              onClick={() => setDetail(o)}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{o.number}</span>
                  <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs text-ink-2">
                    {o.orderType === 'dine-in' ? 'Dine-in' : 'Take-away'}
                  </span>
                </div>
                <p className="text-xs text-ink-2">
                  {new Date(o.createdAt).toLocaleString('id-ID')} · {o.items.reduce((s, it) => s + it.qty, 0)} item
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-coffee">{formatRupiah(o.total)}</p>
                <p className="text-xs text-ink-2">{p ? p.methodLabel : '-'}</p>
              </div>
            </button>
          )
        })}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-5 sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">{detail.number}</h2>
              <button onClick={() => setDetail(null)} className="text-xl text-ink-3">
                ✕
              </button>
            </div>
            {payments[detail.id] ? (
              <div className="rounded-2xl border border-line bg-white p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
                  {buildReceiptText(detail, payments[detail.id], settings)}
                </pre>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-ink-3">Transaksi tidak punya data pembayaran.</p>
            )}
            <button
              onClick={() => shareText(buildReceiptText(detail, payments[detail.id], settings))}
              className="mt-3 w-full rounded-2xl bg-coffee py-3 font-semibold text-white"
            >
              📤 Bagikan Struk
            </button>
            <button
              onClick={() => copyText(buildReceiptText(detail, payments[detail.id], settings))}
              className="mt-2 w-full rounded-2xl border border-line py-3 text-sm font-medium text-ink-2"
            >
              📋 Salin
            </button>
          </div>
        </div>
      )}
    </div>
  )
}