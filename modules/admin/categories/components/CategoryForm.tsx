'use client'

import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { FormActions } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'
import { CategoryFormFields } from '@/modules/admin/categories/components/CategoryFormFields'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseCategoryFormData, type CategoryFormValues } from '@/modules/admin/categories/form-schema'

interface CategoryFormProps {
  action: ActionFormHandler
  defaults?: Partial<CategoryFormValues> & {
    imageUrl?: string | null
    imagePublicId?: string | null
  }
  mode: 'create' | 'edit'
}

export function CategoryForm({ action, defaults, mode }: CategoryFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        const parsed = parseCategoryFormData(formData, { isActive: defaults?.isActive ?? true })
        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <CategoryFormFields
        defaults={defaults}
        includeKey={mode === 'create'}
        includeIsActive={mode === 'edit'}
      />
      <FormActions>
        <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
          {mode === 'create' ? 'Crear categoría' : 'Guardar cambios'}
        </SubmitButton>
        <Link
          href={routes.admin.categories.index}
          className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </FormActions>
    </ValidatedForm>
  )
}
