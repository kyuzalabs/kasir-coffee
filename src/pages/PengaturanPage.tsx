import { useState } from 'react'
import { useStore } from '../store/useStore'
import { categories } from '../data/seed'
import { formatRupiah, genId } from '../lib/money'
import type { MenuItem, StoreSettings } from '../types'

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="font-serif text-2xl font-semibold">Pengaturan</h1>
      <TokoSettings />
      <MenuManagement />
      <ResetDemo />
    </div>
  )
}

function TokoSettings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const [form, setForm] = useState<StoreSettings>({ ...settings })
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<StoreSettings>) => setForm((f) => ({ ...f, ...patch }))

  const save = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-3 font-serif text-lg font-semibold">Info Toko</h2>
      <div className="space-y-3">
        <Field label="Nama toko">
          <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Alamat">
          <input className={inputCls} value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>
        <Field label="No. telepon">
          <input className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Pesan di struk">
          <input className={inputCls} value={form.receiptFooter} onChange={(e) => set({ receiptFooter: e.target.value })} />
        </Field>
      </div>

      <h2 className="mb-3 mt-6 font-serif text-lg font-semibold">Pajak &amp; Diskon</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Aktifkan pajak (PPN)</span>
          <Toggle checked={form.taxEnabled} onChange={(v) => set({ taxEnabled: v })} />
        </div>
        {form.taxEnabled && (
          <Field label="Persentase pajak (%)">
            <input
              className={inputCls}
              type="number"
              value={form.taxPercent}
              onChange={(e) => set({ taxPercent: Number(e.target.value) })}
            />
          </Field>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm">Aktifkan diskon</span>
          <Toggle checked={form.discountEnabled} onChange={(v) => set({ discountEnabled: v })} />
        </div>
        {form.discountEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis">
              <select
                className={inputCls}
                value={form.discountType}
                onChange={(e) => set({ discountType: e.target.value as 'percent' | 'nominal' })}
              >
                <option value="percent">Persen (%)</option>
                <option value="nominal">Nominal (Rp)</option>
              </select>
            </Field>
            <Field label="Nilai">
              <input
                className={inputCls}
                type="number"
                value={form.discountValue}
                onChange={(e) => set({ discountValue: Number(e.target.value) })}
              />
            </Field>
          </div>
        )}
      </div>

      <button onClick={save} className="mt-5 w-full rounded-2xl bg-coffee py-3 font-semibold text-white">
        {saved ? '✓ Tersimpan' : 'Simpan Pengaturan'}
      </button>
    </section>
  )
}

function MenuManagement() {
  const menu = useStore((s) => s.menu)
  const addMenuItem = useStore((s) => s.addMenuItem)
  const updateMenuItem = useStore((s) => s.updateMenuItem)
  const removeMenuItem = useStore((s) => s.removeMenuItem)
  const toggleMenuItem = useStore((s) => s.toggleMenuItem)

  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0].id)
  const [emoji, setEmoji] = useState('')

  const startEdit = (m: MenuItem) => {
    setEditing(m)
    setName(m.name)
    setPrice(String(m.price))
    setCategoryId(m.categoryId)
    setEmoji(m.emoji || '')
  }

  const resetForm = () => {
    setEditing(null)
    setName('')
    setPrice('')
    setCategoryId(categories[0].id)
    setEmoji('')
  }

  const submit = () => {
    const p = Number(price)
    if (!name.trim() || !p || p <= 0) return
    if (editing) {
      updateMenuItem({ ...editing, name: name.trim(), price: p, categoryId, emoji })
    } else {
      addMenuItem({ id: genId(), name: name.trim(), price: p, categoryId, emoji, isAvailable: true, variants: [], addons: [] })
    }
    resetForm()
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-3 font-serif text-lg font-semibold">Kelola Menu</h2>

      <div className="space-y-2">
        <input className={inputCls} placeholder="Nama menu" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Harga (Rp)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className={inputCls} placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
        </div>
        <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={submit} className="flex-1 rounded-xl bg-coffee py-2.5 font-semibold text-white">
            {editing ? 'Simpan Perubahan' : 'Tambah Menu'}
          </button>
          {editing && (
            <button onClick={resetForm} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-2">
              Batal
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {menu.map((m) => (
          <div key={m.id} className="flex items-center gap-2 rounded-xl border border-line p-3">
            <span className="text-xl">{m.emoji || '☕'}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="text-xs text-ink-2">{formatRupiah(m.price)}</p>
            </div>
            <button
              onClick={() => toggleMenuItem(m.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                m.isAvailable ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
              }`}
            >
              {m.isAvailable ? 'Tersedia' : 'Habis'}
            </button>
            <button onClick={() => startEdit(m)} className="text-sm text-ink-2">
              ✏️
            </button>
            <button onClick={() => removeMenuItem(m.id)} className="text-sm text-danger">
              🗑️
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function ResetDemo() {
  const resetDemo = useStore((s) => s.resetDemo)
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="mt-4 rounded-2xl border border-danger-soft bg-white p-5">
      <h2 className="mb-1 font-serif text-lg font-semibold text-danger">Zona Berbahaya</h2>
      <p className="mb-3 text-sm text-ink-2">Hapus semua transaksi &amp; kembalikan data ke awal (menu demo).</p>
      {confirming ? (
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetDemo()
              setConfirming(false)
            }}
            className="flex-1 rounded-xl bg-danger py-2.5 font-semibold text-white"
          >
            Ya, Reset Data
          </button>
          <button onClick={() => setConfirming(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm text-ink-2">
            Batal
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="w-full rounded-xl border border-danger py-2.5 font-medium text-danger">
          Reset Data Demo
        </button>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-2">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-coffee' : 'bg-line'}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-coffee'