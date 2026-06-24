'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { PART_BRAND_PERMISSION_KEYS } from '@/modules/admin/part-brands/types'
import { partBrandRepository } from '@/modules/admin/part-brands/server/repository'

export async function togglePartBrandStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, PART_BRAND_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de esta marca.')
  }

  try {
    await partBrandRepository.updateStatus(id, !current)
    revalidatePath('/admin/part-brands')

    return successResult(current ? 'Marca desactivada.' : 'Marca activada.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling part brand')
    return errorResult('No se pudo cambiar el estado de la marca.')
  }
}
