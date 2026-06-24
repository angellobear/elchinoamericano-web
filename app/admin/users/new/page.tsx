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
import { UserForm } from '@/modules/admin/users/components/UserForm'

async function create(formData: FormData) {
  'use server'
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  try {
    const parsed = parseUserCreateFormData(formData)
    if (!parsed.success) {
      redirect(`${routes.admin.users.create}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { email, fullName, password, roleId } = parsed.data
    await createUser({ email, fullName, password, roleId })
    logger.info({ email, roleId }, 'User created')
    revalidatePath(routes.admin.users.index)
  } catch (err) {
    logger.error({ err }, 'Error creating user')
    redirect(`${routes.admin.users.index}?error=` + encodeURIComponent('Error al crear usuario'))
  }
  redirect(`${routes.admin.users.index}?success=` + encodeURIComponent('Usuario creado'))
}

export default async function NewUserPage() {
  const payload = await getJwtPayload()
  if (payload?.role !== 'superadmin') redirect(routes.admin.forbidden)

  const roles = await getRoles()

  return (
    <div className="p-8">
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
