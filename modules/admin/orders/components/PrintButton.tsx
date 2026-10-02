'use client'

import { useEffect } from 'react'
import { Download } from 'lucide-react'

/**
 * Abre el diálogo de impresión del navegador, donde se imprime o se elige "Guardar como PDF".
 * Con `auto` lo abre solo al cargar, para que desde el pedido sea un solo clic.
 */
export function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return
    // Pequeña espera para que el logo y el QR estén pintados antes de imprimir.
    const timer = setTimeout(() => window.print(), 600)
    return () => clearTimeout(timer)
  }, [auto])

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
    >
      <Download size={16} />
      Descargar PDF o imprimir
    </button>
  )
}
