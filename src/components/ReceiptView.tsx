import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { buildReceiptText, copyText, shareText } from '../lib/receipt'
import { formatRupiah } from '../lib/money'

export default function ReceiptView() {
  const receipt = useStore((s) => s.receipt)
  const settings = useStore((s) => s.settings)
  const setReceipt = useStore((s) => s.setReceipt)
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () => (receipt ? buildReceiptText(receipt.order, receipt.payment, settings) : ''),
    [receipt, settings],
  )

  if (!receipt) return null
  const { order, payment } = receipt

  const onCopy = async () => {
    await copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 py-8">
      <div className="mb-4 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-1 font-serif text-xl font-semibold">Pembayaran Berhasil</h1>
        <p className="text-sm text-ink-2">
          {formatRupiah(order.total)} · {payment.methodLabel}
        </p>
      </div>

      <div className="print-area rounded-2xl border border-line bg-white p-5 shadow-sm">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">{text}</pre>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-coffee"
        >
          🖨️ Simpan PDF
        </button>
        <button
          onClick={() => shareText(text)}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-coffee"
        >
          📤 Bagikan
        </button>
        <button
          onClick={onCopy}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-coffee"
        >
          {copied ? '✓ Tersalin' : '📋 Salin Teks'}
        </button>
        <button
          onClick={() => setReceipt(null)}
          className="rounded-xl bg-coffee px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
        >
          ✨ Pesanan Baru
        </button>
      </div>
    </div>
  )
}