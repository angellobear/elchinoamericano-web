'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { updateProduct } from '@/lib/db/products'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'

const PRODUCT_PERMISSION_KEYS = ['products'] as const

export async function toggleProductStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, PRODUCT_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de este producto.')
  }

  try {
    await updateProduct(id, { isActive: !current })
    revalidatePath('/admin/products')

    return successResult(current ? 'Producto desactivado.' : 'Producto activado.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling product')
    return errorResult('No se pudo cambiar el estado del producto.')
  }
}
