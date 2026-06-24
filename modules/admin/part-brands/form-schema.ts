import { z } from 'zod'
import { getBoolean, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

export const partBrandFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre es demasiado largo.'),
  originCountry: z.string().max(100, 'El país de origen es demasiado largo.').optional(),
  isActive: z.boolean().default(true),
})

export type PartBrandFormValues = z.infer<typeof partBrandFormSchema>

export function parsePartBrandFormData(formData: FormData, defaults?: { isActive?: boolean }) {
  return partBrandFormSchema.safeParse({
    name: getRequiredString(formData, 'name'),
    originCountry: getOptionalString(formData, 'originCountry'),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
  })
}
