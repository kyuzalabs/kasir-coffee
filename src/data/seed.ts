import type { Addon, Category, MenuItem, VariantGroup } from '../types'

export const categories: Category[] = [
  { id: 'kopi', name: 'Kopi', emoji: '☕' },
  { id: 'nonkopi', name: 'Non-Kopi', emoji: '🥛' },
  { id: 'teh', name: 'Teh', emoji: '🍵' },
  { id: 'makanan', name: 'Makanan', emoji: '🥐' },
  { id: 'snack', name: 'Snack', emoji: '🍪' },
]

const sizeGroup: VariantGroup = {
  id: 'size',
  label: 'Ukuran',
  options: [
    { id: 'reguler', label: 'Reguler', price: 0 },
    { id: 'large', label: 'Large', price: 6000 },
  ],
}

const tempGroup: VariantGroup = {
  id: 'temp',
  label: 'Suhu',
  options: [
    { id: 'panas', label: 'Panas', price: 0 },
    { id: 'dingin', label: 'Dingin', price: 0 },
  ],
}

const sugarGroup: VariantGroup = {
  id: 'gula',
  label: 'Level Gula',
  options: [
    { id: 'normal', label: 'Normal', price: 0 },
    { id: 'less', label: 'Less', price: 0 },
    { id: 'half', label: 'Half', price: 0 },
  ],
}

const drinkExtras: Addon[] = [
  { id: 'extra-shot', label: 'Extra Shot', price: 5000 },
  { id: 'oat-milk', label: 'Oat Milk', price: 6000 },
  { id: 'whipped', label: 'Whipped Cream', price: 4000 },
]

const drinkVariants: VariantGroup[] = [sizeGroup, tempGroup, sugarGroup]

function drink(
  id: string,
  categoryId: string,
  name: string,
  price: number,
  emoji: string,
  addons: Addon[] = drinkExtras,
): MenuItem {
  return { id, categoryId, name, price, emoji, isAvailable: true, variants: drinkVariants, addons }
}

function food(id: string, categoryId: string, name: string, price: number, emoji: string): MenuItem {
  return { id, categoryId, name, price, emoji, isAvailable: true, variants: [], addons: [] }
}

export const seedMenu: MenuItem[] = [
  drink('espresso', 'kopi', 'Espresso', 15000, '☕'),
  drink('americano', 'kopi', 'Americano', 18000, '☕'),
  drink('latte', 'kopi', 'Cafe Latte', 25000, '☕'),
  drink('cappuccino', 'kopi', 'Cappuccino', 27000, '☕'),
  drink('kopi-gula-aren', 'kopi', 'Kopi Susu Gula Aren', 22000, '🟤'),
  drink('matcha', 'nonkopi', 'Matcha Latte', 28000, '🍵'),
  drink('chocolate', 'nonkopi', 'Chocolate', 24000, '🍫'),
  drink('vanilla-latte', 'nonkopi', 'Vanilla Latte', 26000, '🥛'),
  drink('lemon-tea', 'teh', 'Lemon Tea', 18000, '🍋'),
  drink('teh-tarik', 'teh', 'Teh Tarik', 16000, '🥤'),
  drink('green-tea', 'teh', 'Green Tea', 17000, '🍵'),
  food('croissant', 'makanan', 'Croissant', 22000, '🥐'),
  food('roti-bakar', 'makanan', 'Roti Bakar', 20000, '🍞'),
  food('sandwich', 'makanan', 'Sandwich Telur', 25000, '🥪'),
  food('nasi-goreng', 'makanan', 'Nasi Goreng Spesial', 32000, '🍛'),
  food('cookies', 'snack', 'Cookies Coklat', 15000, '🍪'),
  food('french-fries', 'snack', 'French Fries', 18000, '🍟'),
  food('croffle', 'snack', 'Croffle', 25000, '🧇'),
]