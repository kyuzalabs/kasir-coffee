# Kasir Coffee Shop ☕

Aplikasi kasir (POS) untuk coffee shop — web app / **PWA** yang nyaman dipakai di HP & tablet.
Dibangun sesuai spesifikasi: alur lengkap pilih menu → keranjang → bayar (simulasi) → struk otomatis → riwayat.

## Tech Stack
- **React 18 + Vite + TypeScript**
- **Tailwind CSS v4** (tema putih elegan, aksen cokelat kopi `#8B5E3C`)
- **Zustand** (state + persist ke localStorage — data tidak hilang saat refresh)
- **vite-plugin-pwa** (manifest + service worker, bisa di-install & jalan offline)
- **Vitest** (test perhitungan)

## Cara Menjalankan (lokal)

```bash
npm install        # install dependency
npm run dev        # mode development (http://localhost:5173)
```

## Build Produksi

```bash
npm run build      # tsc --noEmit && vite build → folder dist/
npm run preview    # pratinjau hasil build (http://localhost:4173)
```

## Test

```bash
npm test           # jalankan unit test perhitungan (subtota l, pajak, diskon, kembalian)
```

## Fitur

**Fase 1 — Katalog & Keranjang**
- Katalog kartu (emoji/nama/harga), kategori (Kopi, Non-Kopi, Teh, Makanan, Snack), pencarian.
- Varian: ukuran (Reguler/Large), suhu, level gula; tambahan (extra shot, oat milk, dst).
- 18 menu seed realistis. Keranjang: tambah/tambah/kurangi/hapus, catatan, subtotal/pajak/diskon/total real-time, Dine-in / Take-away + no. meja.

**Fase 2 — Pembayaran & Struk (Simulasi)**
- Tunai (uang diterima + tombol nominal cepat + kembalian otomatis), QRIS (QR dummy + hitung mundur), E-Wallet (GoPay/OVO/DANA/ShopeePay), Kartu Debit.
- Struk otomatis: simpan PDF, bagikan (Web Share/WhatsApp), salin teks, pesanan baru.

**Fase 3 — Riwayat & Pengaturan**
- Riwayat (filter tanggal & metode, ringkasan penjualan/transaksi/menu terlaris, lihat ulang & bagikan struk).
- Pengaturan: kelola menu (tambah/ubah/hapus/status), info toko, pajak (default PPN 11%) & diskon, reset data demo.

## Arsitektur Data (siap diganti ke backend)
Lapisan data dipisah lewat **repository** — saat ini disimpan di `localStorage` (via Zustand persist).
Untuk pindah ke backend (REST/Supabase/dll), ganti implementasi penyimpanan di `src/store/useStore.ts`
(kunci: `menu`, `orders`, `payments`, `settings`) tanpa mengubah komponen UI.

## Mengganti Simulasi Pembayaran ke Gateway Asli (Midtrans / Xendit)
Antarmuka pembayaran sudah dipisah sebagai **`PaymentProvider`**:

1. Buat adapter baru mengimplementasi kontrak yang sama dengan `src/lib/payment.ts`
   (method `create()`, `handleSuccess()`, `handleFailed()`).
2. Daftarkan kunci API di file `.env` (jangan commit): `VITE_MIDTRANS_CLIENT_KEY=...`.
3. Ganti panggilan simulasi di `src/components/PaymentSheet.tsx` (fungsi `success`/`fail`)
   dengan panggilan ke adapter gateway — lalu tangani callback sukses/gagal dari Midtrans/Xendit.
4. Data `Payment { method, amountPaid, change, status, paidAt }` tetap sama, jadi riwayat & struk tidak berubah.

> Catatan keamanan: kunci **server** (servernya) jangan pernah ditaruh di frontend. Untuk Midtrans/Xendit,
> endpoint charge sebaiknya lewat backend kecil (mis. serverless function) yang memegang API key rahasia.

## Struktur Folder

```
src/
  components/   # UI: MenuItemCard, ItemModal, CartPanel, PaymentSheet, ReceiptView, BottomNav
  pages/        # KasirPage, RiwayatPage, PengaturanPage
  store/        # useStore.ts (Zustand state + persist)
  data/         # seed.ts (18 menu + kategori)
  lib/          # money.ts (format Rupiah & hitung), receipt.ts (struk), payment.ts (antarmuka)
  types.ts      # tipe TypeScript
  tests/        # unit test perhitungan
```