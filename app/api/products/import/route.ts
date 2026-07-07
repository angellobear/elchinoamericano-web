import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { categories, partBrands, suppliers, vehicleBrands, vehicleModels } from '@/lib/db/schema'
import { createProduct, setSpecs, setImages, setAlternateCodes, setCompatibilities } from '@/lib/db/products'
import { createVehicleBrand, createVehicleModel } from '@/lib/db/vehicle-brands'
import { buildSlugWithSku } from '@/lib/product-slugs'
import { normalizeVehicleBrand } from '@/lib/vehicle-brand-aliases'

const bodySchema = z.object({
  // Required
  title: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  type: z.enum(['original', 'oem', 'aftermarket']),
  price: z.union([z.string().min(1), z.number()]),
  // Optional core fields
  shortTitle: z.string().max(100).optional(),
  replacementCode: z.string().max(100).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  costPrice: z.union([z.string(), z.number()]).optional(),
  discountPct: z.union([z.string(), z.number()]).optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  weightKg: z.union([z.string(), z.number()]).optional(),
  stock: z.number().int().min(0).optional(),
  minStockAlert: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  slug: z.string().max(255).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  // Categoría: por nombre O por ID (ID tiene prioridad si se envían ambos)
  categoryName: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  // Marca de autoparte: por nombre O por ID
  partBrandName: z.string().optional(),
  partBrandId: z.number().int().positive().optional(),
  // Proveedor: por nombre O por ID
  supplierName: z.string().optional(),
  supplierId: z.number().int().positive().optional(),
  // Relations
  specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  alternateCodes: z.array(z.object({
    code: z.string(),
    source: z.string().optional(),
  })).optional(),
  // Compatibilidades de vehículo — se crean marca/modelo si no existen
  compatibilities: z.array(z.object({
    brandName: z.string().min(1),
    modelName: z.string().min(1),
    yearStart: z.number().int().optional(),
    yearEnd: z.number().int().optional(),
    notes: z.string().optional(),
  })).optional(),
})

function toDecimal(v: string | number | undefined): string | undefined {
  if (v === undefined || v === '') return undefined
  return String(v)
}

/** Busca o crea la marca y el modelo, devuelve el vehicleModelId. */
async function resolveOrCreateVehicleModel(
  db: Awaited<ReturnType<typeof getDb>>,
  brandName: string,
  modelName: string,
): Promise<number> {
  const canonicalBrand = normalizeVehicleBrand(brandName)
  const canonicalModel = modelName.trim().replace(/\s+/g, ' ')

  let brand = await db.query.vehicleBrands.findFirst({
    where: eq(vehicleBrands.name, canonicalBrand),
    columns: { id: true },
  })

  if (!brand) {
    const brandId = await createVehicleBrand({ name: canonicalBrand, origin: 'unknown' })
    brand = { id: brandId }
  }

  const model = await db.query.vehicleModels.findFirst({
    where: and(eq(vehicleModels.brandId, brand.id), eq(vehicleModels.name, canonicalModel)),
    columns: { id: true },
  })

  if (model) return model.id

  return createVehicleModel({ brandId: brand.id, name: canonicalModel })
}

export async function POST(req: NextRequest) {
  const importToken = process.env.PRODUCT_IMPORT_TOKEN
  if (!importToken || importToken.length < 32) {
    return NextResponse.json({ error: 'PRODUCT_IMPORT_TOKEN no configurado correctamente' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (token !== importToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data
  const sku = data.sku.toUpperCase()

  const db = await getDb()

  // Resolver IDs: se prefiere el ID directo; si no, se busca por nombre
  const [categoryRow, partBrandRow, supplierRow] = await Promise.all([
    data.categoryId
      ? { id: data.categoryId }
      : data.categoryName ? db.query.categories.findFirst({ where: eq(categories.name, data.categoryName), columns: { id: true } }) : undefined,
    data.partBrandId
      ? { id: data.partBrandId }
      : data.partBrandName ? db.query.partBrands.findFirst({ where: eq(partBrands.name, data.partBrandName), columns: { id: true } }) : undefined,
    data.supplierId
      ? { id: data.supplierId }
      : data.supplierName ? db.query.suppliers.findFirst({ where: eq(suppliers.name, data.supplierName), columns: { id: true } }) : undefined,
  ])

  // Resolver vehicleModelIds (con auto-create si no existen)
  const compatEntries: { vehicleModelId: number; yearStart?: number; yearEnd?: number; notes?: string }[] = []
  if (data.compatibilities?.length) {
    for (const compat of data.compatibilities) {
      const vehicleModelId = await resolveOrCreateVehicleModel(db, compat.brandName, compat.modelName)
      compatEntries.push({ vehicleModelId, yearStart: compat.yearStart, yearEnd: compat.yearEnd, notes: compat.notes })
    }
  }

  const slug = buildSlugWithSku(data.slug || data.title, sku)

  try {
    const result = await createProduct({
      title: data.title,
      shortTitle: data.shortTitle,
      sku,
      replacementCode: data.replacementCode?.toUpperCase(),
      type: data.type,
      condition: data.condition ?? 'new',
      price: toDecimal(data.price)!,
      costPrice: toDecimal(data.costPrice),
      discountPct: toDecimal(data.discountPct),
      weightKg: toDecimal(data.weightKg),
      stock: data.stock ?? 0,
      minStockAlert: data.minStockAlert ?? 5,
      categoryId: categoryRow?.id ?? null,
      partBrandId: partBrandRow?.id ?? null,
      supplierId: supplierRow?.id ?? null,
      description: data.description,
      shortDescription: data.shortDescription,
      slug,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
    })

    if (!result) throw new Error('createProduct devolvió undefined')

    const { id, code } = result

    await Promise.all([
      data.specs?.length ? setSpecs(id, data.specs) : null,
      data.alternateCodes?.length ? setAlternateCodes(id, data.alternateCodes) : null,
      data.images?.length
        ? setImages(id, data.images.map((img, i) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary ?? i === 0,
            sortOrder: i,
          })))
        : null,
      compatEntries.length ? setCompatibilities(id, compatEntries) : null,
    ])

    return NextResponse.json({ success: true, code, id, slug })
  } catch (err: unknown) {
    console.error('[import/products] error:', err)
    const msg = err instanceof Error ? err.message : 'Error inesperado'
    if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU o slug', detail: msg }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
