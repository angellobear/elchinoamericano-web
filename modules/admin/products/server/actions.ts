'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getProductById, updateProduct } from '@/lib/db/products'
import { buildProductPath } from '@/lib/product-slugs'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'

const PRODUCT_PERMISSION_KEYS = ['products'] as const

async function revalidatePublicProduct(id: number) {
  const product = await getProductById(id, { withTrashed: true })
  if (product) revalidatePath(buildProductPath(product))
  revalidatePath('/catalogo')
  revalidatePath('/')
}

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
    // La página pública se sirve igual (inactiva); hay que refrescarla ya, no en 1h
    await revalidatePublicProduct(id)

    return successResult(current ? 'Producto desactivado.' : 'Producto activado.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling product')
    return errorResult('No se pudo cambiar el estado del producto.')
  }
}
