import Link from 'next/link'
import { FileSearch, Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#0d1f3c]/8 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileSearch size={36} className="text-[#0d1f3c]" />
        </div>

        {/* Number */}
        <div className="text-8xl font-bold text-[#0d1f3c] mb-2 leading-none">404</div>
        <div className="w-12 h-1 bg-[#e03030] rounded-full mx-auto mb-6" />

        {/* Text */}
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Lo que buscas no existe o fue movido a otra dirección.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors"
          >
            <Home size={14} />
            Ir al inicio
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
