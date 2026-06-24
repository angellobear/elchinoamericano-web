'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { updateCategory } from '@/lib/db/categories'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'

const CATEGORY_PERMISSION_KEYS = ['categories'] as const

export async function toggleCategoryStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, CATEGORY_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de esta categoría.')
  }

  try {
    await updateCategory(id, { isActive: !current })
    revalidatePath('/admin/categories')

    return successResult(current ? 'Categoría desactivada.' : 'Categoría activada.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling category')
    return errorResult('No se pudo cambiar el estado de la categoría.')
  }
}
