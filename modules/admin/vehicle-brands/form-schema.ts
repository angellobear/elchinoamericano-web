import { z } from 'zod'
import { getBoolean, getNumber, getRequiredString } from '@/modules/admin/shared/server/form-data'

export const vehicleBrandOriginSchema = z.enum(['chinese', 'american', 'foreign'])

export const vehicleBrandFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre es demasiado largo.'),
  origin: vehicleBrandOriginSchema,
  sortOrder: z.number().int().min(0, 'El orden no puede ser negativo.'),
  isActive: z.boolean().default(true),
  isVisibleOnWeb: z.boolean().default(false),
})

export const vehicleModelFormSchema = z.object({
  name: z.string().min(1, 'El nombre del modelo es obligatorio.').max(150, 'El nombre del modelo es demasiado largo.'),
  displacement: z.string().max(20, 'El cilindraje es demasiado largo.').optional(),
  fuelType: z.string().max(20, 'El combustible es demasiado largo.').optional(),
  transmission: z.string().max(20, 'La transmisión es demasiado larga.').optional(),
  driveType: z.string().max(10, 'La tracción es demasiado larga.').optional(),
  bodyType: z.string().max(30, 'El tipo es demasiado largo.').optional(),
  isActive: z.boolean().optional(),
})

export type VehicleBrandFormValues = z.infer<typeof vehicleBrandFormSchema>
export type VehicleModelFormValues = z.infer<typeof vehicleModelFormSchema>

export function parseVehicleBrandFormData(
  formData: FormData,
  defaults?: { isActive?: boolean, isVisibleOnWeb?: boolean },
) {
  return vehicleBrandFormSchema.safeParse({
    name: getRequiredString(formData, 'name'),
    origin: getRequiredString(formData, 'origin'),
    sortOrder: getNumber(formData, 'sortOrder', 0),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
    isVisibleOnWeb: formData.has('isVisibleOnWeb')
      ? getBoolean(formData, 'isVisibleOnWeb')
      : (defaults?.isVisibleOnWeb ?? false),
  })
}
