import Link from 'next/link'
import { ShieldX, LayoutDashboard } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#e03030]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={36} className="text-[#e03030]" />
        </div>
        <div className="text-8xl font-bold text-[#e03030] mb-2 leading-none">403</div>
        <div className="w-12 h-1 bg-[#0d1f3c] rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Acceso denegado</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          No tienes permiso para acceder a esta sección.
          Contacta al administrador si crees que es un error.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors"
        >
          <LayoutDashboard size={14} />
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
