'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { supplierRepository } from '@/modules/admin/suppliers/server/repository'
import { SUPPLIER_PERMISSION_KEYS } from '@/modules/admin/suppliers/types'

export async function toggleSupplierStatusAction(id: number, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, SUPPLIER_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para cambiar el estado de este proveedor.')
  }

  try {
    await supplierRepository.updateStatus(id, !current)
    revalidatePath('/admin/suppliers')

    return successResult(current ? 'Proveedor desactivado.' : 'Proveedor activado.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling supplier')
    return errorResult('No se pudo cambiar el estado del proveedor.')
  }
}

export async function deleteSupplierAction(id: number) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (!hasModulePermission(payload, SUPPLIER_PERMISSION_KEYS, 'can_delete')) {
    return errorResult('No tienes permiso para eliminar este proveedor.')
  }

  try {
    await supplierRepository.softDelete(id)
    revalidatePath('/admin/suppliers')

    return successResult('Proveedor eliminado.')
  } catch (err) {
    logger.error({ err, id }, 'Error deleting supplier')
    return errorResult('No se pudo eliminar el proveedor.')
  }
}
