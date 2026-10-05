'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { markAllInboxRead, setInboxHidden, setInboxRead, softDeleteInboxMessage } from '@/lib/db/inbox'
import { logger } from '@/lib/logger'
import { todayInEcuador } from '@/lib/today-ecuador'
import { errorResult, successResult, type ActionResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission, type PermissionAction } from '@/modules/admin/shared/server/permissions'
import { filtersFromParams, INBOX_PERMISSION_KEYS, type InboxSearchParams } from '@/modules/admin/inbox/types'

// El badge vive en el layout del admin: se revalida todo el árbol /admin.
async function guarded(action: PermissionAction, denied: string, work: () => Promise<string>): Promise<ActionResult> {
  const payload = await getJwtPayload()
  if (!payload) return errorResult('Tu sesión expiró. Vuelve a iniciar sesión.')
  if (!hasModulePermission(payload, INBOX_PERMISSION_KEYS, action)) return errorResult(denied)

  try {
    const message = await work()
    revalidatePath('/admin', 'layout')
    return successResult(message)
  } catch (err) {
    logger.error({ err }, 'Inbox action failed')
    return errorResult('No se pudo completar la acción.')
  }
}

export async function setInboxReadAction(id: number, read: boolean) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await setInboxRead(id, read)
    return read ? 'Marcado como leído.' : 'Marcado como no leído.'
  })
}

export async function setInboxHiddenAction(id: number, hidden: boolean) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await setInboxHidden(id, hidden)
    return hidden ? 'Mensaje oculto.' : 'Mensaje visible otra vez.'
  })
}

export async function deleteInboxMessageAction(id: number) {
  return guarded('can_delete', 'No tienes permiso para eliminar mensajes.', async () => {
    await softDeleteInboxMessage(id)
    return 'Mensaje eliminado.'
  })
}

export async function markAllInboxReadAction(params: InboxSearchParams) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await markAllInboxRead(filtersFromParams(params, todayInEcuador()).filters)
    return 'Todo marcado como leído.'
  })
}
