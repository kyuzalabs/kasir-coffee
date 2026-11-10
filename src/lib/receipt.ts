import type { Order, Payment, StoreSettings } from '../types'
import { formatRupiah } from './money'

export function buildReceiptText(order: Order, payment: Payment, settings: StoreSettings): string {
  const dash = '-'.repeat(32)
  const pad = (label: string, value: string) => `${label.padEnd(10)} ${value}`

  const lines: string[] = []
  lines.push(settings.name.toUpperCase())
  if (settings.address) lines.push(settings.address)
  if (settings.phone) lines.push('Telp: ' + settings.phone)
  lines.push(dash)
  lines.push(pad('No', order.number))
  lines.push(pad('Tgl', new Date(order.createdAt).toLocaleString('id-ID')))
  lines.push(pad('Tipe', order.orderType === 'dine-in' ? 'Dine-in' : 'Take-away'))
  if (order.customerName) lines.push(pad('Nama', order.customerName))
  if (order.tableName) lines.push(pad('Meja', order.tableName))
  lines.push(dash)

  for (const it of order.items) {
    lines.push(`${it.name} x${it.qty}`)
    for (const v of it.variants) {
      lines.push(`    - ${v.groupLabel}: ${v.optionLabel}${v.price > 0 ? ' (+' + formatRupiah(v.price) + ')' : ''}`)
    }
    for (const a of it.addons) {
      lines.push(`    + ${a.label} (+${formatRupiah(a.price)})`)
    }
    if (it.note) lines.push(`    * ${it.note}`)
    lines.push(pad('', formatRupiah(it.unitPrice * it.qty)))
  }

  lines.push(dash)
  lines.push(pad('Subtotal', formatRupiah(order.subtotal)))
  if (order.tax > 0) lines.push(pad(`PPN ${settings.taxPercent}%`, formatRupiah(order.tax)))
  if (order.discount > 0) lines.push(pad('Diskon', '-' + formatRupiah(order.discount)))
  lines.push(pad('TOTAL', formatRupiah(order.total)))
  lines.push(dash)
  lines.push(pad('Bayar', `${payment.methodLabel} ${formatRupiah(payment.amountPaid)}`))
  if (payment.change > 0) lines.push(pad('Kembali', formatRupiah(payment.change)))
  lines.push(dash)
  if (settings.receiptFooter) lines.push(settings.receiptFooter)

  return lines.join('\n')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export async function shareText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text })
      return true
    } catch {
      return false
    }
  }
  // Fallback: WhatsApp
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  return true
}