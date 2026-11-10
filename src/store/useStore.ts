import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Addon,
  CartItem,
  MenuItem,
  Order,
  OrderType,
  Payment,
  PaymentMethod,
  SelectedVariant,
  StoreSettings,
} from '../types'
import { seedMenu } from '../data/seed'
import { calcChange, calcTotals, genId, orderNumber } from '../lib/money'

export interface ReceiptPayload {
  order: Order
  payment: Payment
}

export const defaultSettings: StoreSettings = {
  name: 'Kopi Senja',
  address: 'Jl. Melati No. 12, Jakarta',
  phone: '0812-3456-7890',
  receiptFooter: 'Terima kasih, sampai jumpa lagi! ☕',
  taxEnabled: true,
  taxPercent: 11,
  discountEnabled: false,
  discountType: 'percent',
  discountValue: 0,
}

interface OrderMeta {
  orderType: OrderType
  customerName: string
  tableName: string
}

interface KasirState extends OrderMeta {
  menu: MenuItem[]
  orders: Order[]
  payments: Record<string, Payment>
  settings: StoreSettings
  cart: CartItem[]
  receipt: ReceiptPayload | null

  addToCart: (item: MenuItem, variants: SelectedVariant[], addons: Addon[], qty: number, note: string) => void
  incItem: (id: string) => void
  decItem: (id: string) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setOrderMeta: (m: Partial<OrderMeta>) => void
  checkout: () => Order
  pay: (orderId: string, method: PaymentMethod, methodLabel: string, amountPaid: number) => Payment
  setReceipt: (r: ReceiptPayload | null) => void

  updateSettings: (s: Partial<StoreSettings>) => void
  addMenuItem: (m: MenuItem) => void
  updateMenuItem: (m: MenuItem) => void
  removeMenuItem: (id: string) => void
  toggleMenuItem: (id: string) => void
  resetDemo: () => void
}

export const useStore = create<KasirState>()(
  persist(
    (set, get) => ({
      menu: seedMenu,
      orders: [],
      payments: {},
      settings: defaultSettings,
      cart: [],
      receipt: null,
      orderType: 'dine-in',
      customerName: '',
      tableName: '',

      addToCart: (item, variants, addons, qty, note) => {
        const unitPrice =
          item.price +
          variants.reduce((s, v) => s + v.price, 0) +
          addons.reduce((s, a) => s + a.price, 0)
        set((state) => {
          const existing = state.cart.find(
            (c) =>
              c.menuItemId === item.id &&
              c.note === note &&
              JSON.stringify(c.variants) === JSON.stringify(variants) &&
              JSON.stringify(c.addons) === JSON.stringify(addons),
          )
          if (existing) {
            return {
              cart: state.cart.map((c) => (c.id === existing.id ? { ...c, qty: c.qty + qty } : c)),
            }
          }
          const line: CartItem = {
            id: genId(),
            menuItemId: item.id,
            name: item.name,
            qty,
            unitPrice,
            variants,
            addons,
            note,
          }
          return { cart: [...state.cart, line] }
        })
      },

      incItem: (id) =>
        set((state) => ({
          cart: state.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)),
        })),

      decItem: (id) =>
        set((state) => ({
          cart: state.cart
            .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
            .filter((c) => c.qty > 0),
        })),

      removeItem: (id) => set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),

      clearCart: () => set({ cart: [] }),

      setOrderMeta: (m) => set({ ...m } as Partial<KasirState>),

      checkout: () => {
        const { cart, settings, orders, orderType, customerName, tableName } = get()
        const t = calcTotals(cart, settings)
        const order: Order = {
          id: genId(),
          number: orderNumber(orders.length + 1),
          items: cart.map((c) => ({ ...c, variants: [...c.variants], addons: [...c.addons] })),
          subtotal: t.subtotal,
          tax: t.tax,
          discount: t.discount,
          total: t.total,
          orderType,
          customerName,
          tableName,
          createdAt: Date.now(),
        }
        set((state) => ({ orders: [order, ...state.orders], cart: [] }))
        return order
      },

      pay: (orderId, method, methodLabel, amountPaid) => {
        const order = get().orders.find((o) => o.id === orderId)
        const total = order ? order.total : 0
        const isCash = method === 'cash'
        const payment: Payment = {
          orderId,
          method,
          methodLabel,
          amountPaid: isCash ? amountPaid : total,
          change: isCash ? calcChange(amountPaid, total) : 0,
          status: 'success',
          paidAt: Date.now(),
        }
        set((state) => ({ payments: { ...state.payments, [orderId]: payment } }))
        return payment
      },

      setReceipt: (r) => set({ receipt: r }),

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      addMenuItem: (m) => set((state) => ({ menu: [...state.menu, m] })),

      updateMenuItem: (m) =>
        set((state) => ({ menu: state.menu.map((x) => (x.id === m.id ? m : x)) })),

      removeMenuItem: (id) => set((state) => ({ menu: state.menu.filter((x) => x.id !== id) })),

      toggleMenuItem: (id) =>
        set((state) => ({
          menu: state.menu.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)),
        })),

      resetDemo: () =>
        set({
          menu: seedMenu,
          orders: [],
          payments: {},
          settings: defaultSettings,
          cart: [],
          receipt: null,
        }),
    }),
    {
      name: 'kasir-coffee-store',
      version: 2,
      partialize: (state) => ({
        menu: state.menu,
        orders: state.orders,
        payments: state.payments,
        settings: state.settings,
        cart: state.cart,
      }),
    },
  ),
)