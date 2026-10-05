'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { setInboxReadAction } from '@/modules/admin/inbox/server/actions'

/** Marca el lead como leído una sola vez al abrir el detalle (a prueba de StrictMode). */
export function MarkReadOnOpen({ id }: { id: number }) {
  const router = useRouter()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    void setInboxReadAction(id, true).then(() => router.refresh())
  }, [id, router])

  return null
}
