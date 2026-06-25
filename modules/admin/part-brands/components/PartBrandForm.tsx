'use client'

import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { PartBrandFormFields } from '@/modules/admin/part-brands/components/PartBrandFormFields'
import { parsePartBrandFormData, type PartBrandFormValues } from '@/modules/admin/part-brands/form-schema'
import { FormActions } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface PartBrandFormProps {
  action: ActionFormHandler
  mode: 'create' | 'edit'
  defaults?: Partial<PartBrandFormValues> & {
    logoUrl?: string | null
    logoPublicId?: string | null
  }
}

export function PartBrandForm({ action, mode, defaults }: PartBrandFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        const parsed = parsePartBrandFormData(formData, { isActive: defaults?.isActive ?? true })
        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <PartBrandFormFields
        defaults={defaults}
        includeIsActive={mode === 'edit'}
      />
      <FormActions>
        <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
          {mode === 'create' ? 'Crear marca' : 'Guardar cambios'}
        </SubmitButton>
        <Link
          href={routes.admin.partBrands.index}
          className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </FormActions>
    </ValidatedForm>
  )
}
