export interface Category {
  id: string
  name: string
  emoji?: string
}

export interface VariantOption {
  id: string
  label: string
  price: number
}

export interface VariantGroup {
  id: string
  label: string
  options: VariantOption[]
}

export interface Addon {
  id: string
  label: string
  price: number
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  price: number
  emoji?: string
  isAvailable: boolean
  variants: VariantGroup[]
  addons: Addon[]
}

export interface SelectedVariant {
  groupId: string
  groupLabel: string
  optionId: string
  optionLabel: string
  price: number
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  qty: number
  unitPrice: number
  variants: SelectedVariant[]
  addons: Addon[]
  note: string
}

export type OrderType = 'dine-in' | 'takeaway'

export interface Order {
  id: string
  number: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  orderType: OrderType
  customerName: string
  tableName: string
  createdAt: number
}

export type PaymentMethod = 'cash' | 'qris' | 'ewallet' | 'debit'

export interface Payment {
  orderId: string
  method: PaymentMethod
  methodLabel: string
  amountPaid: number
  change: number
  status: 'success' | 'failed'
  paidAt: number
}

export interface StoreSettings {
  name: string
  address: string
  phone: string
  receiptFooter: string
  taxEnabled: boolean
  taxPercent: number
  discountEnabled: boolean
  discountType: 'percent' | 'nominal'
  discountValue: number
}