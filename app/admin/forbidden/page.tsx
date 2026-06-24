import Link from 'next/link'
import { ShieldX, LayoutDashboard } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={36} className="text-brand" />
        </div>
        <div className="text-8xl font-bold text-brand mb-2 leading-none">403</div>
        <div className="w-12 h-1 bg-navy rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Acceso denegado</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          No tienes permiso para acceder a esta sección.
          Contacta al administrador si crees que es un error.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors"
        >
          <LayoutDashboard size={14} />
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
