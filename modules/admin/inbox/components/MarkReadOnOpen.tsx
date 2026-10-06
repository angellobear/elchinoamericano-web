'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { setInboxReadAction } from '@/modules/admin/inbox/server/actions'

/** Marca el lead como leído una sola vez al abrir el detalle (a prueba de StrictMode). */
export function MarkReadOnOpen({ id }: { id: number }) {
  const router = useRouter()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    setInboxReadAction(id, true)
      .then((result) => (result.ok ? router.refresh() : toast.error(result.message)))
      .catch(() => toast.error('No se pudo marcar como leído.'))
  }, [id, router])

  return null
}
