import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserById, updateUser, getRoles } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseUserEditFormData } from '@/modules/admin/users/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { UserForm } from '@/modules/admin/users/components/UserForm'

async function save(id: string, _: ActionState, formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  try {
    const parsed = parseUserEditFormData(formData, { isSelf: id === payload.userId, defaultIsActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { fullName, roleId, isActive, password: newPassword } = parsed.data

    const update: Parameters<typeof updateUser>[1] = { fullName, roleId, isActive }
    if (newPassword && newPassword.length >= 8) {
      update.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    // Evitar que el superadmin se desactive a sí mismo
    if (id === payload.userId) {
      delete update.isActive
      delete update.roleId
    }

    await updateUser(id, update)
    logger.info({ id }, 'User updated')
    revalidatePath(routes.admin.users.index)
  } catch (err) {
    logger.error({ err }, 'Error updating user')
    return errorResult('Error al guardar usuario')
  }

  return successResult('Usuario guardado', undefined, { redirectTo: routes.admin.users.index })
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  const { id } = await params
  const [user, roles] = await Promise.all([getUserById(id), getRoles()])
  if (!user) notFound()

  const isSelf = user.id === payload.userId
  const saveWithId = save.bind(null, user.id)

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.users.index}
        backLabel="Volver a usuarios"
        title="Editar usuario"
        description={user.email}
      />
      <FormCard>
        <UserForm
          action={saveWithId}
          mode="edit"
          roles={roles}
          isSelf={isSelf}
          defaults={{
            fullName: user.fullName ?? undefined,
            email: user.email,
            roleId: user.roleId ?? null,
            isActive: user.isActive ?? true,
          }}
        />
      </FormCard>
    </div>
  )
}
