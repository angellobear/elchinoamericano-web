import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { categories, partBrands, suppliers } from '@/lib/db/schema'
import { createProduct, setSpecs, setImages, setAlternateCodes } from '@/lib/db/products'
import { buildSlugWithSku } from '@/lib/product-slugs'

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
  // Name-based lookups (resolved to IDs, null if not found)
  categoryName: z.string().optional(),
  partBrandName: z.string().optional(),
  supplierName: z.string().optional(),
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
})

function toDecimal(v: string | number | undefined): string | undefined {
  if (v === undefined || v === '') return undefined
  return String(v)
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

  // Name → ID lookups
  const db = await getDb()
  const [categoryRow, partBrandRow, supplierRow] = await Promise.all([
    data.categoryName ? db.query.categories.findFirst({ where: eq(categories.name, data.categoryName) }) : undefined,
    data.partBrandName ? db.query.partBrands.findFirst({ where: eq(partBrands.name, data.partBrandName) }) : undefined,
    data.supplierName ? db.query.suppliers.findFirst({ where: eq(suppliers.name, data.supplierName) }) : undefined,
  ])

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
    ])

    return NextResponse.json({ success: true, code, id, slug })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado'
    if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU o slug', detail: msg }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
