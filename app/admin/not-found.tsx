import Link from 'next/link'
import { LayoutDashboard, FileSearch } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-navy/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <FileSearch size={28} className="text-navy" />
        </div>
        <div className="text-7xl font-bold text-navy leading-none mb-2">404</div>
        <div className="w-10 h-0.5 bg-brand rounded-full mx-auto mb-5" />
        <h1 className="text-lg font-semibold text-gray-800 mb-2">Sección no encontrada</h1>
        <p className="text-gray-500 text-sm mb-7">
          Esta página del panel no existe o fue eliminada.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium"
        >
          <LayoutDashboard size={14} />
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
