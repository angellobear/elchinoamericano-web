'use client'

import Link from 'next/link'
import type { Role } from '@/types'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { FormActions } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseUserCreateFormData, parseUserEditFormData } from '@/modules/admin/users/form-schema'
import { UserFormFields } from '@/modules/admin/users/components/UserFormFields'

interface UserFormProps {
  action: (formData: FormData) => void | Promise<void>
  mode: 'create' | 'edit'
  roles: Role[]
  defaults?: {
    fullName?: string
    email?: string
    roleId?: number | null
    isActive?: boolean
  }
  isSelf?: boolean
}

export function UserForm({ action, mode, roles, defaults, isSelf = false }: UserFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        const parsed = mode === 'create'
          ? parseUserCreateFormData(formData)
          : parseUserEditFormData(formData, { isSelf, defaultIsActive: defaults?.isActive })

        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <UserFormFields mode={mode} roles={roles} defaults={defaults} isSelf={isSelf} />
      <FormActions>
        <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
          {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </SubmitButton>
        <Link
          href={routes.admin.users.index}
          className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </FormActions>
    </ValidatedForm>
  )
}
