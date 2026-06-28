'use client'

import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { VehicleBrandFormFields } from '@/modules/admin/vehicle-brands/components/VehicleBrandFormFields'
import { parseVehicleBrandFormData, type VehicleBrandFormValues } from '@/modules/admin/vehicle-brands/form-schema'
import { FormActions } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface VehicleBrandFormProps {
  action: ActionFormHandler
  mode: 'create' | 'edit'
  defaults?: Partial<VehicleBrandFormValues> & {
    logoUrl?: string | null
    logoPublicId?: string | null
  }
  compact?: boolean
}

export function VehicleBrandForm({
  action,
  mode,
  defaults,
  compact = false,
}: VehicleBrandFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        const parsed = parseVehicleBrandFormData(formData, {
          isActive: defaults?.isActive ?? true,
          isVisibleOnWeb: defaults?.isVisibleOnWeb ?? false,
        })
        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <VehicleBrandFormFields
        defaults={defaults}
        includeIsActive={mode === 'edit'}
      />
      <FormActions>
        <SubmitButton className={`${compact ? 'w-full ' : ''}px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60`}>
          {mode === 'create' ? 'Crear marca' : 'Guardar cambios'}
        </SubmitButton>
        {compact ? null : (
          <Link
            href={routes.admin.vehicleBrands.index}
            className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        )}
      </FormActions>
    </ValidatedForm>
  )
}
