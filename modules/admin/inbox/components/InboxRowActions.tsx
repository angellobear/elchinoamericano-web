'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, MailOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmActionButton } from '@/modules/admin/orders/components/ConfirmActionButton'
import {
  deleteInboxMessageAction,
  setInboxHiddenAction,
  setInboxReadAction,
} from '@/modules/admin/inbox/server/actions'
import type { ActionResult } from '@/modules/admin/shared/types/action-result'

interface Props {
  id: number
  isRead: boolean
  isHidden: boolean
  canEdit: boolean
  canDelete: boolean
  /** En el detalle se muestran con texto; en la tabla, solo íconos. */
  withLabels?: boolean
  /** En el detalle: al marcar no leído o eliminar se vuelve a la bandeja. */
  backHref?: string
}

const iconBtn = 'inline-flex items-center gap-1.5 p-1.5 rounded-md text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors disabled:opacity-40 text-sm'

export function InboxRowActions({ id, isRead, isHidden, canEdit, canDelete, withLabels = false, backHref }: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) toast.error(result.message)
      router.refresh()
    })
  }

  function toggleRead() {
    startTransition(async () => {
      const result = await setInboxReadAction(id, !isRead)
      if (!result.ok) toast.error(result.message)
      else if (isRead && backHref) {
        toast.success(result.message)
        router.push(backHref)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <>
          <button type="button" disabled={pending} className={iconBtn}
            onClick={toggleRead}
            aria-label={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
            title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}>
            {isRead ? <Mail size={15} /> : <MailOpen size={15} />}
            {withLabels && (isRead ? 'No leído' : 'Leído')}
          </button>
          <button type="button" disabled={pending} className={iconBtn}
            onClick={() => run(() => setInboxHiddenAction(id, !isHidden))}
            aria-label={isHidden ? 'Mostrar' : 'Ocultar'}
            title={isHidden ? 'Mostrar' : 'Ocultar'}>
            {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {withLabels && (isHidden ? 'Mostrar' : 'Ocultar')}
          </button>
        </>
      )}
      {canDelete && (
        <ConfirmActionButton
          action={async () => {
            const r = await deleteInboxMessageAction(id)
            if (r.ok && backHref) router.push(backHref)
            return r
          }}
          trigger={<><Trash2 size={15} />{withLabels && 'Eliminar'}</>}
          triggerLabel="Eliminar"
          triggerClassName={`${iconBtn} hover:text-red-600! hover:bg-red-50!`}
          title="¿Eliminar este mensaje?"
          description="Dejará de aparecer en la bandeja. Si solo quieres sacarlo del listado, usa Ocultar."
          confirmLabel="Eliminar"
        />
      )}
    </div>
  )
}
