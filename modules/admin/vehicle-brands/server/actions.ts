'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { vehicleBrandRepository } from '@/modules/admin/vehicle-brands/server/repository'
import { VEHICLE_BRAND_PERMISSION_KEYS } from '@/modules/admin/vehicle-brands/types'

export async function toggleVehicleBrandStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, VEHICLE_BRAND_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de esta marca.')
  }

  try {
    await vehicleBrandRepository.updateStatus(id, !current)
    revalidatePath('/admin/vehicle-brands')

    return successResult(current ? 'Marca desactivada.' : 'Marca activada.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling vehicle brand')
    return errorResult('No se pudo cambiar el estado de la marca.')
  }
}
