'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { markAllInboxReadAction } from '@/modules/admin/inbox/server/actions'
import type { InboxSearchParams } from '@/modules/admin/inbox/types'

export function MarkAllReadButton({ params }: { params: InboxSearchParams }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAllInboxReadAction(params)
          if (result.ok) toast.success(result.message)
          else toast.error(result.message)
          router.refresh()
        })
      }
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
    >
      <CheckCheck size={15} />
      Marcar todo como leído
    </button>
  )
}
