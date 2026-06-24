'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { activateUser, deactivateUser } from '@/lib/db/users'
import { logger } from '@/lib/logger'
import { errorResult, successResult } from '@/modules/admin/shared/types/action-result'

export async function toggleUserStatusAction(id: string, current: boolean) {
  const payload = await getJwtPayload()

  if (!payload) {
    return errorResult('Tu sesion expiró. Vuelve a iniciar sesión.')
  }

  if (payload.role !== 'superadmin') {
    return errorResult('No tienes permiso para cambiar el estado de este usuario.')
  }

  if (payload.userId === id) {
    return errorResult('No puedes cambiar el estado de tu propio usuario.')
  }

  try {
    if (current) {
      await deactivateUser(id)
    } else {
      await activateUser(id)
    }

    logger.info({ id, action: current ? 'deactivate' : 'activate' }, 'User toggled')
    revalidatePath('/admin/users')

    return successResult(current ? 'Usuario desactivado.' : 'Usuario activado.')
  } catch (err) {
    logger.error({ err, id, current }, 'Error toggling user')
    return errorResult('No se pudo cambiar el estado del usuario.')
  }
}
