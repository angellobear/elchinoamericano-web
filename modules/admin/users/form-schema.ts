import { z } from 'zod'
import { getBoolean, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

export const userCreateFormSchema = z.object({
  fullName: z.string().max(100, 'El nombre es demasiado largo.').optional(),
  email: z.email('Ingresa un email válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  roleId: z.coerce.number().int().positive('Selecciona un rol válido.'),
})

export const userEditFormSchema = z.object({
  fullName: z.string().max(100, 'El nombre es demasiado largo.').optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').optional(),
  roleId: z.coerce.number().int().positive('Selecciona un rol válido.').optional(),
  isActive: z.boolean().default(true),
})

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>
export type UserEditFormValues = z.infer<typeof userEditFormSchema>

export function parseUserCreateFormData(formData: FormData) {
  return userCreateFormSchema.safeParse({
    fullName: getOptionalString(formData, 'fullName'),
    email: getRequiredString(formData, 'email').toLowerCase(),
    password: String(formData.get('password') ?? ''),
    roleId: Number(formData.get('roleId')),
  })
}

export function parseUserEditFormData(formData: FormData, options: { isSelf: boolean; defaultIsActive?: boolean }) {
  return userEditFormSchema.safeParse({
    fullName: getOptionalString(formData, 'fullName'),
    password: getOptionalString(formData, 'password'),
    roleId: options.isSelf ? undefined : Number(formData.get('roleId')),
    isActive: options.isSelf ? (options.defaultIsActive ?? true) : getBoolean(formData, 'isActive'),
  })
}
