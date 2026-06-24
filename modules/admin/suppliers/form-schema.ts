import { z } from 'zod'
import { getBoolean, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

export const supplierFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.').max(200, 'El nombre es demasiado largo.'),
  contactName: z.string().max(100, 'El contacto es demasiado largo.').optional(),
  email: z.email('Ingresa un email válido.').optional().or(z.literal(undefined)),
  phone: z.string().max(30, 'El teléfono es demasiado largo.').optional(),
  address: z.string().max(500, 'La dirección es demasiado larga.').optional(),
  isActive: z.boolean().default(true),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>

export function parseSupplierFormData(formData: FormData, defaults?: { isActive?: boolean }) {
  return supplierFormSchema.safeParse({
    name: getRequiredString(formData, 'name'),
    contactName: getOptionalString(formData, 'contactName'),
    email: getOptionalString(formData, 'email'),
    phone: getOptionalString(formData, 'phone'),
    address: getOptionalString(formData, 'address'),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
  })
}
