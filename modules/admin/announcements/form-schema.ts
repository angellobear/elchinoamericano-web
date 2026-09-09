import { z } from 'zod'
import { getBoolean, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

const dateField = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `La fecha de ${label} es obligatoria.`)

export const announcementFormSchema = z
  .object({
    title: z.string().max(150, 'El título es demasiado largo.').optional(),
    description: z.string().max(500, 'La descripción es demasiado larga.').optional(),
    linkUrl: z
      .string()
      .max(500, 'El enlace es demasiado largo.')
      .regex(/^(https?:\/\/|\/)/, 'El enlace debe empezar con https:// o con /')
      .optional(),
    startsAt: dateField('inicio'),
    endsAt: dateField('fin'),
    isActive: z.boolean().default(true),
  })
  .refine((values) => values.endsAt >= values.startsAt, {
    message: 'La fecha de fin no puede ser anterior a la de inicio.',
    path: ['endsAt'],
  })

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

export function parseAnnouncementFormData(formData: FormData, defaults?: { isActive?: boolean }) {
  return announcementFormSchema.safeParse({
    title: getOptionalString(formData, 'title'),
    description: getOptionalString(formData, 'description'),
    linkUrl: getOptionalString(formData, 'linkUrl'),
    startsAt: getRequiredString(formData, 'startsAt'),
    endsAt: getRequiredString(formData, 'endsAt'),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
  })
}
