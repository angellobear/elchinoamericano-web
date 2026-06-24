import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1f3c] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-9xl font-black text-white/10 leading-none select-none mb-2">404</div>
        <div className="w-12 h-1 bg-[#e03030] rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-white mb-2">Página no encontrada</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          El repuesto que buscas no está aquí. Prueba en el catálogo.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e03030] text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Home size={14} />
          Ir al catálogo
        </Link>
      </div>
    </div>
  )
}
