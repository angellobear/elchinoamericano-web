import { z } from 'zod'
import { getBoolean, getNumber, getOptionalString, getRequiredString } from '@/modules/admin/shared/server/form-data'

export const productTypeSchema = z.enum(['original', 'oem', 'aftermarket'])
export const productConditionSchema = z.enum(['new', 'used', 'refurbished'])

export const productFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.').max(255, 'El título es demasiado largo.'),
  shortTitle: z.string().max(100, 'El título corto es demasiado largo.').optional(),
  sku: z.string().max(100, 'El SKU es demasiado largo.').optional(),
  type: productTypeSchema,
  condition: productConditionSchema,
  categoryId: z.number().int().positive().optional(),
  partBrandId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive().optional(),
  price: z.string().min(1, 'El precio es obligatorio.'),
  costPrice: z.string().optional(),
  discountPct: z.string().optional(),
  weightKg: z.string().optional(),
  minStockAlert: z.number().int().min(0, 'El stock mínimo no puede ser negativo.'),
  stockInitial: z.number().int().min(0, 'El stock inicial no puede ser negativo.').optional(),
  shortDescription: z.string().max(500, 'La descripción corta es demasiado larga.').optional(),
  description: z.string().optional(),
  slug: z.string().max(255, 'El slug es demasiado largo.').optional(),
  metaTitle: z.string().max(255, 'El meta título es demasiado largo.').optional(),
  metaDescription: z.string().max(500, 'La meta descripción es demasiado larga.').optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

function optionalPositiveNumber(value: FormDataEntryValue | null): number | undefined {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined
}

export function parseProductFormData(formData: FormData, defaults?: { isActive?: boolean; stockInitial?: number }) {
  return productFormSchema.safeParse({
    title: getRequiredString(formData, 'title'),
    shortTitle: getOptionalString(formData, 'shortTitle'),
    sku: getOptionalString(formData, 'sku'),
    type: getRequiredString(formData, 'type'),
    condition: (getOptionalString(formData, 'condition') ?? 'new'),
    categoryId: optionalPositiveNumber(formData.get('categoryId')),
    partBrandId: optionalPositiveNumber(formData.get('partBrandId')),
    supplierId: optionalPositiveNumber(formData.get('supplierId')),
    price: getRequiredString(formData, 'price'),
    costPrice: getOptionalString(formData, 'costPrice'),
    discountPct: getOptionalString(formData, 'discountPct'),
    weightKg: getOptionalString(formData, 'weightKg'),
    minStockAlert: getNumber(formData, 'minStockAlert', 5),
    stockInitial: formData.has('stockInitial') ? getNumber(formData, 'stockInitial', defaults?.stockInitial ?? 0) : undefined,
    shortDescription: getOptionalString(formData, 'shortDescription'),
    description: getOptionalString(formData, 'description'),
    slug: getOptionalString(formData, 'slug'),
    metaTitle: getOptionalString(formData, 'metaTitle'),
    metaDescription: getOptionalString(formData, 'metaDescription'),
    isFeatured: getBoolean(formData, 'isFeatured'),
    isActive: formData.has('isActive') ? getBoolean(formData, 'isActive') : (defaults?.isActive ?? true),
  })
}

export function parseIndexedFormData(formData: FormData, prefix: string, keys: string[]) {
  const rows: Record<string, string>[] = []
  let index = 0
  while (formData.has(`${prefix}[${index}][${keys[0]}]`)) {
    rows.push(
      Object.fromEntries(keys.map((key) => [key, String(formData.get(`${prefix}[${index}][${key}]`) ?? '')]))
    )
    index++
  }
  return rows
}
