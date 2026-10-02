import Link from 'next/link'
import type { ReactNode } from 'react'
import { PrintButton } from '@/modules/admin/orders/components/PrintButton'

interface PrintLayoutProps {
  backHref: string
  /** true cuando se llega con ?print=1: abre el diálogo de impresión al cargar. */
  autoPrint: boolean
  children: ReactNode
}

/** Marco de las vistas imprimibles: barra de acciones (no se imprime) + hoja del documento. */
export function PrintLayout({ backHref, autoPrint, children }: PrintLayoutProps) {
  return (
    <div className="p-4 md:p-8 print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={backHref} className="text-sm font-medium text-slate-500 hover:text-navy">
          ← Volver al pedido
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-slate-400 sm:block">Para PDF, elige &quot;Guardar como PDF&quot;.</p>
          <PrintButton auto={autoPrint} />
        </div>
      </div>
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
        {children}
      </div>
    </div>
  )
}
