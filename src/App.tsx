import { useState } from 'react'
import { useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import KasirPage from './pages/KasirPage'
import RiwayatPage from './pages/RiwayatPage'
import PengaturanPage from './pages/PengaturanPage'
import ReceiptView from './components/ReceiptView'

export type Page = 'kasir' | 'riwayat' | 'pengaturan'

export default function App() {
  const [page, setPage] = useState<Page>('kasir')
  const receipt = useStore((s) => s.receipt)

  // Saat ada struk (pembayaran baru selesai), tampilkan full screen
  if (receipt) {
    return <ReceiptView />
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      <main className="flex-1 pb-20">
        {page === 'kasir' && <KasirPage />}
        {page === 'riwayat' && <RiwayatPage />}
        {page === 'pengaturan' && <PengaturanPage />}
      </main>
      <BottomNav page={page} onChange={setPage} />
    </div>
  )
}