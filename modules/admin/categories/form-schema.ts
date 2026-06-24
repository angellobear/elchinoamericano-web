import { z } from 'zod'
import { getBoolean, getNumber, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

const categoryKeyRegex = /^[a-z0-9-]+$/

export const categoryFormSchema = z.object({
  key: z.string().min(1, 'La clave es obligatoria.').max(50, 'La clave es demasiado larga.').regex(categoryKeyRegex, 'Usa solo letras minúsculas, números y guiones.'),
  name: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre es demasiado largo.'),
  description: z.string().max(500, 'La descripción es demasiado larga.').optional(),
  sortOrder: z.number().int().min(0, 'El orden no puede ser negativo.'),
  isActive: z.boolean().default(true),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export function parseCategoryFormData(formData: FormData, defaults?: { isActive?: boolean }) {
  return categoryFormSchema.safeParse({
    key: getRequiredString(formData, 'key'),
    name: getRequiredString(formData, 'name'),
    description: getOptionalString(formData, 'description'),
    sortOrder: getNumber(formData, 'sortOrder', 0),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
  })
}
