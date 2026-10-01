'use client'

import { Link2 } from 'lucide-react'
import { toast } from 'sonner'

export function CopyLinkButton({ url }: { url: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar el enlace.')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
    >
      <Link2 size={14} />
      Copiar enlace público
    </button>
  )
}
