'use client'

import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AnnouncementFormFields } from '@/modules/admin/announcements/components/AnnouncementFormFields'
import { parseAnnouncementFormData, type AnnouncementFormValues } from '@/modules/admin/announcements/form-schema'
import { FormActions } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface AnnouncementFormProps {
  action: ActionFormHandler
  mode: 'create' | 'edit'
  defaults?: Partial<AnnouncementFormValues> & {
    imageUrl?: string | null
    imagePublicId?: string | null
  }
}

export function AnnouncementForm({ action, mode, defaults }: AnnouncementFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        const file = formData.get('image')
        const hasNewImage = file instanceof File && file.size > 0
        const keepsImage = formData.get('image_removed') !== '1' && Boolean(formData.get('image_current_url'))

        if (!hasNewImage && !keepsImage) return 'La imagen del anuncio es obligatoria.'

        const parsed = parseAnnouncementFormData(formData, { isActive: defaults?.isActive ?? true })
        if (parsed.success) return null
        return getZodErrorMessage(parsed.error)
      }}
    >
      <AnnouncementFormFields defaults={defaults} includeIsActive={mode === 'edit'} />
      <FormActions>
        <SubmitButton className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60">
          {mode === 'create' ? 'Crear anuncio' : 'Guardar cambios'}
        </SubmitButton>
        <Link
          href={routes.admin.announcements.index}
          className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </FormActions>
    </ValidatedForm>
  )
}
