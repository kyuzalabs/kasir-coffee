import { describe, it, expect } from 'vitest'
import { calcTotals, calcChange } from '../lib/money'
import type { CartItem, StoreSettings } from '../types'

const settings: StoreSettings = {
  name: 'test',
  address: '',
  phone: '',
  receiptFooter: '',
  taxEnabled: true,
  taxPercent: 11,
  discountEnabled: false,
  discountType: 'percent',
  discountValue: 0,
}

function item(unitPrice: number, qty: number): CartItem {
  return { id: 'x', menuItemId: 'm', name: 'X', qty, unitPrice, variants: [], addons: [], note: '' }
}

describe('calcTotals', () => {
  it('subtotal = jumlah unitPrice x qty', () => {
    const t = calcTotals([item(25000, 2), item(10000, 1)], settings)
    expect(t.subtotal).toBe(60000)
  })

  it('pajak 11%', () => {
    const t = calcTotals([item(100000, 1)], settings)
    expect(t.tax).toBe(11000)
    expect(t.total).toBe(111000)
  })

  it('tanpa pajak', () => {
    const t = calcTotals([item(100000, 1)], { ...settings, taxEnabled: false })
    expect(t.tax).toBe(0)
    expect(t.total).toBe(100000)
  })

  it('diskon persen 10%', () => {
    const t = calcTotals([item(100000, 1)], {
      ...settings,
      taxEnabled: false,
      discountEnabled: true,
      discountType: 'percent',
      discountValue: 10,
    })
    expect(t.discount).toBe(10000)
    expect(t.total).toBe(90000)
  })

  it('diskon nominal', () => {
    const t = calcTotals([item(100000, 1)], {
      ...settings,
      taxEnabled: false,
      discountEnabled: true,
      discountType: 'nominal',
      discountValue: 25000,
    })
    expect(t.discount).toBe(25000)
    expect(t.total).toBe(75000)
  })

  it('diskon tidak melebihi subtotal', () => {
    const t = calcTotals([item(10000, 1)], {
      ...settings,
      taxEnabled: false,
      discountEnabled: true,
      discountType: 'nominal',
      discountValue: 50000,
    })
    expect(t.discount).toBe(10000)
    expect(t.total).toBe(0)
  })
})

describe('calcChange', () => {
  it('kembalian normal', () => {
    expect(calcChange(100000, 75000)).toBe(25000)
  })
  it('uang pas = 0', () => {
    expect(calcChange(75000, 75000)).toBe(0)
  })
  it('uang kurang -> 0', () => {
    expect(calcChange(50000, 75000)).toBe(0)
  })
})