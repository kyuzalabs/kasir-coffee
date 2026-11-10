import type { CartItem, StoreSettings } from '../types'

export function formatRupiah(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export interface Totals {
  subtotal: number
  tax: number
  discount: number
  total: number
}

export function calcTotals(items: CartItem[], s: StoreSettings): Totals {
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0)
  const tax = s.taxEnabled ? Math.round((subtotal * s.taxPercent) / 100) : 0
  let discount = 0
  if (s.discountEnabled) {
    discount =
      s.discountType === 'percent'
        ? Math.round((subtotal * s.discountValue) / 100)
        : s.discountValue
  }
  // Diskon tidak boleh melebihi subtotal
  discount = Math.min(discount, subtotal)
  const total = Math.max(0, subtotal + tax - discount)
  return { subtotal, tax, discount, total }
}

export function calcChange(received: number, total: number): number {
  return Math.max(0, Math.round(received - total))
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

export function orderNumber(seq: number): string {
  return 'INV-' + String(seq).padStart(6, '0')
}