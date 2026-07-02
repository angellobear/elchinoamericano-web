import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createUser, getRoles } from '@/lib/db/users'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseUserCreateFormData } from '@/modules/admin/users/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { UserForm } from '@/modules/admin/users/components/UserForm'

async function create(_: ActionState, formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  try {
    const parsed = parseUserCreateFormData(formData)
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { email, fullName, password, roleId } = parsed.data
    await createUser({ email, fullName, password, roleId })
    logger.info({ email, roleId }, 'User created')
    revalidatePath(routes.admin.users.index)
  } catch (err) {
    logger.error({ err }, 'Error creating user')
    return errorResult('Error al crear usuario')
  }

  return successResult('Usuario creado', undefined, { redirectTo: routes.admin.users.index })
}

export default async function NewUserPage() {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  const roles = await getRoles()

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.users.index}
        backLabel="Volver a usuarios"
        title="Nuevo usuario"
        description="Solo el superadmin puede crear usuarios"
      />
      <FormCard>
        <UserForm action={create} mode="create" roles={roles} />
      </FormCard>
    </div>
  )
}
