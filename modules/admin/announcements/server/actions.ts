'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { ANNOUNCEMENT_PERMISSION_KEYS } from '@/modules/admin/announcements/types'
import { announcementRepository } from '@/modules/admin/announcements/server/repository'

// El modal público lee /api/announcement, así que hay que botar su caché en cada cambio.
// Sin export: en un módulo 'use server' todo lo exportado debe ser async.
function revalidateAnnouncements() {
  revalidatePath('/admin/announcements')
  revalidatePath('/api/announcement')
}

export async function toggleAnnouncementStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesión expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, ANNOUNCEMENT_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de este anuncio.')
  }

  try {
    await announcementRepository.updateStatus(id, !current)
    revalidateAnnouncements()

    return successResult(current ? 'Anuncio desactivado.' : 'Anuncio activado.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling announcement')
    return errorResult('No se pudo cambiar el estado del anuncio.')
  }
}

export async function deleteAnnouncementAction(id: number) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesión expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, ANNOUNCEMENT_PERMISSION_KEYS, 'can_delete')) {
    return errorResult('No tienes permiso para eliminar anuncios.')
  }

  try {
    await announcementRepository.remove(id)
    revalidateAnnouncements()

    return successResult('Anuncio eliminado.')
  } catch (err) {
    logger.error({ err, id }, 'Error deleting announcement')
    return errorResult('No se pudo eliminar el anuncio.')
  }
}
