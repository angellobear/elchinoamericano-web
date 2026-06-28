import { getDb } from './client'
import {
  products, productImages, productSpecs, productAlternateCodes,
  productEquivalencies, productCompatibilities, stockMovements, vehicleModels,
} from './schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import type { Product, ProductType, VehicleOrigin } from '@/types'
import {
  buildNotDeletedWhere,
  type SoftDeleteQueryOptions,
} from '@/lib/db/soft-delete'

// DECIMAL columns come back as string from the driver — convert for arithmetic
function offerPrice(price: string, pct?: string | null, until?: Date | null): number | undefined {
  if (!pct || !until || until <= new Date()) return undefined
  return parseFloat((Number(price) * (1 - Number(pct) / 100)).toFixed(2))
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  search?:     string
  type?:       string
  isFeatured?: boolean
  isActive?:   boolean
  limit?:      number
  offset?:     number
  withTrashed?: boolean
}) {
  const db = await getDb()
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.isActive, filters?.isActive ?? true),
      buildNotDeletedWhere(products.deletedAt, { withTrashed: filters?.withTrashed }),
      filters?.isFeatured !== undefined ? eq(products.isFeatured, filters.isFeatured) : undefined,
      filters?.type   ? eq(products.type, filters.type) : undefined,
      // LOWER()+LIKE portable across MySQL (utf8mb4_unicode_ci) and PostgreSQL
      filters?.search ? sql`lower(${products.title}) like lower(${'%' + filters.search + '%'})` : undefined,
    ),
    with: { category: true, partBrand: true, images: true, specs: true, alternateCodes: true },
    orderBy: desc(products.createdAt),
    limit:  filters?.limit,
    offset: filters?.offset,
  })
  return rows.map(r => ({ ...r, offerPrice: offerPrice(r.price, r.discountPct, r.discountUntil) }))
}

export async function getProductBySlug(slug: string) {
  const db = await getDb()
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true), buildNotDeletedWhere(products.deletedAt)),
    with:  { category: true, partBrand: true, supplier: true, images: true, specs: true, alternateCodes: true, compatibilities: { with: { model: { with: { brand: true } } } } },
  })
  if (!row) return null

  // Equivalencies are bidirectional — fetch separately
  const eqRows = await db.query.productEquivalencies.findMany({
    where: eq(productEquivalencies.productId, row.id),
    with:  { equivalent: { with: { images: { where: eq(productImages.isPrimary, true) } } } },
  })

  return { ...row, offerPrice: offerPrice(row.price, row.discountPct, row.discountUntil), equivalencies: eqRows.map(e => e.equivalent) }
}

export async function getProductById(id: number, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const row = await db.query.products.findFirst({
    where: and(eq(products.id, id), buildNotDeletedWhere(products.deletedAt, options)),
    with:  { category: true, partBrand: true, images: true, specs: true, alternateCodes: true, compatibilities: true },
  })
  if (!row) return null
  // Object.assign preserves Drizzle's inferred relation types (spread loses them)
  return Object.assign(row, { offerPrice: offerPrice(row.price, row.discountPct, row.discountUntil) })
}

// For admin inventory page
export async function getInventory(options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  return db.query.products.findMany({
    where: and(eq(products.isActive, true), buildNotDeletedWhere(products.deletedAt, options)),
    columns: { id: true, code: true, title: true, stock: true, minStockAlert: true, isActive: true },
    with: { category: { columns: { name: true } } },
    orderBy: products.stock,
  })
}

// For admin product list
export async function getProductList(
  filters?: {
    search?: string
    type?: string
    categoryId?: number
    vehicleBrandId?: number
    isActive?: boolean | 'all'
  },
  options?: SoftDeleteQueryOptions,
) {
  const db = await getDb()
  const { search, type, categoryId, vehicleBrandId, isActive = true } = filters ?? {}
  return db.query.products.findMany({
    where: and(
      buildNotDeletedWhere(products.deletedAt, options),
      isActive !== 'all' ? eq(products.isActive, isActive) : undefined,
      type ? eq(products.type, type) : undefined,
      categoryId ? eq(products.categoryId, categoryId) : undefined,
      vehicleBrandId
        ? sql`EXISTS (
            SELECT 1 FROM ${productCompatibilities} pc
            INNER JOIN ${vehicleModels} vm ON pc.vehicle_model_id = vm.id
            WHERE pc.product_id = ${products.id} AND vm.brand_id = ${vehicleBrandId}
          )`
        : undefined,
      search
        ? sql`(
            lower(${products.title}) like lower(${'%' + search + '%'}) or
            lower(coalesce(${products.shortTitle}, '')) like lower(${'%' + search + '%'}) or
            lower(coalesce(${products.description}, '')) like lower(${'%' + search + '%'}) or
            lower(coalesce(${products.sku}, '')) like lower(${'%' + search + '%'}) or
            lower(coalesce(${products.replacementCode}, '')) like lower(${'%' + search + '%'})
          )`
        : undefined,
    ),
    with: { category: true, partBrand: true },
    orderBy: desc(products.createdAt),
    limit: 200,
  })
}

// For admin dashboard stats
export async function getProductStats(options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const [all, outOfStock, lowStock] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), buildNotDeletedWhere(products.deletedAt, options))),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), eq(products.stock, 0), buildNotDeletedWhere(products.deletedAt, options))),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), sql`${products.stock} <= ${products.minStockAlert}`, sql`${products.stock} > 0`, buildNotDeletedWhere(products.deletedAt, options))),
  ])
  return {
    total:      Number(all[0]?.count ?? 0),
    outOfStock: Number(outOfStock[0]?.count ?? 0),
    lowStock:   Number(lowStock[0]?.count ?? 0),
  }
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createProduct(data: typeof products.$inferInsert) {
  const { rowId, code, created } = await withAudit(async (tx) => {
    const result = await tx.insert(products).values(data)
    const insertId = Array.isArray(result)
      ? (result[0] as { insertId?: number } | undefined)?.insertId
      : (result as { insertId?: number }).insertId

    if (!insertId) {
      throw new Error('No se pudo obtener el ID del producto creado.')
    }

    const rowId = Number(insertId)
    const code = `CA-${String(rowId).padStart(4, '0')}`
    await tx.update(products).set({ code }).where(eq(products.id, rowId))
    const created = await tx.query.products.findFirst({ where: eq(products.id, rowId) })
    return { rowId, code, created }
  })

  await logActivitySafe('CREATE', 'products', rowId, undefined, created as Record<string, unknown> | undefined)
  return { id: rowId, code }
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.products.findFirst({ where: eq(products.id, id) })
    await tx.update(products).set({ ...data, updatedAt: dbNow() }).where(eq(products.id, id))
    const after = await tx.query.products.findFirst({ where: eq(products.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'products', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteProduct(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.products.findFirst({ where: eq(products.id, id) })
    await tx.update(products).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(products.id, id))
    const after = await tx.query.products.findFirst({ where: eq(products.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'products', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

// ─── Relations (replace-all pattern) ─────────────────────────────────────────

export async function setAlternateCodes(productId: number, codes: { code: string; source?: string }[]) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.productAlternateCodes.findMany({
      where: eq(productAlternateCodes.productId, productId),
    })
    await tx.delete(productAlternateCodes).where(eq(productAlternateCodes.productId, productId))
    if (codes.length) await tx.insert(productAlternateCodes).values(codes.map(c => ({ ...c, productId })))
    const after = await tx.query.productAlternateCodes.findMany({
      where: eq(productAlternateCodes.productId, productId),
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'product_alternate_codes', productId, { entries: before }, { entries: after })
}

export async function setEquivalencies(productId: number, equivalentIds: number[]) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.productEquivalencies.findMany({
      where: eq(productEquivalencies.productId, productId),
    })
    await tx.delete(productEquivalencies).where(eq(productEquivalencies.productId, productId))
    await tx.delete(productEquivalencies).where(eq(productEquivalencies.equivalentId, productId))
    if (!equivalentIds.length) {
      return { before, after: [] }
    }
    // Both directions so queries from either side work
    await tx.insert(productEquivalencies).values(
      equivalentIds.flatMap(eId => [
        { productId, equivalentId: eId },
        { productId: eId, equivalentId: productId },
      ])
    )
    const after = await tx.query.productEquivalencies.findMany({
      where: eq(productEquivalencies.productId, productId),
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'product_equivalencies', productId, { entries: before }, { entries: after ?? [] })
}

export async function setCompatibilities(productId: number, entries: { vehicleModelId: number; yearStart?: number; yearEnd?: number; notes?: string }[]) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.productCompatibilities.findMany({
      where: eq(productCompatibilities.productId, productId),
    })
    await tx.delete(productCompatibilities).where(eq(productCompatibilities.productId, productId))
    if (entries.length) await tx.insert(productCompatibilities).values(entries.map(e => ({ ...e, productId })))
    const after = await tx.query.productCompatibilities.findMany({
      where: eq(productCompatibilities.productId, productId),
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'product_compatibilities', productId, { entries: before }, { entries: after })
}

export async function setSpecs(productId: number, specs: { label: string; value: string; sortOrder?: number }[]) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.productSpecs.findMany({
      where: eq(productSpecs.productId, productId),
    })
    await tx.delete(productSpecs).where(eq(productSpecs.productId, productId))
    if (specs.length) await tx.insert(productSpecs).values(specs.map((s, i) => ({ ...s, productId, sortOrder: s.sortOrder ?? i })))
    const after = await tx.query.productSpecs.findMany({
      where: eq(productSpecs.productId, productId),
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'product_specs', productId, { entries: before }, { entries: after })
}

export async function setImages(
  productId: number,
  images: { url: string; cloudinaryPublicId?: string | null; altText?: string; isPrimary: boolean; sortOrder: number }[]
) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.productImages.findMany({
      where: eq(productImages.productId, productId),
    })
    await tx.delete(productImages).where(eq(productImages.productId, productId))
    if (images.length) await tx.insert(productImages).values(images.map(img => ({ ...img, productId })))
    const after = await tx.query.productImages.findMany({
      where: eq(productImages.productId, productId),
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'product_images', productId, { entries: before }, { entries: after })
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export async function updateStock(productId: number, newStock: number, userId: string, reason?: string) {
  const { beforeProduct, afterProduct, movement } = await withAudit(async (tx) => {
    const current = await tx.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { stock: true },
    })
    const beforeProduct = await tx.query.products.findFirst({ where: eq(products.id, productId) })
    await tx.update(products).set({ stock: newStock, updatedAt: dbNow() }).where(eq(products.id, productId))
    await tx.insert(stockMovements).values({
      productId,
      quantity:     newStock - (current?.stock ?? 0),
      movementType: 'adjustment',
      reason,
      userId,
    })
    const afterProduct = await tx.query.products.findFirst({ where: eq(products.id, productId) })
    const movement = {
      productId,
      quantity: newStock - (current?.stock ?? 0),
      movementType: 'adjustment',
      reason: reason ?? null,
      userId,
    }
    return { beforeProduct, afterProduct, movement }
  })

  await Promise.all([
    logActivitySafe('UPDATE', 'products', productId, beforeProduct as Record<string, unknown> | undefined, afterProduct as Record<string, unknown> | undefined, { userId }),
    logActivitySafe('CREATE', 'stock_movements', productId, undefined, movement as Record<string, unknown>, { userId }),
  ])
}

// ─── Public catalog helpers ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPublicProduct(row: any): Product {
  const computedOfferPrice: number | undefined =
    row.offerPrice ?? offerPrice(row.price, row.discountPct, row.discountUntil)
  return {
    id: row.id,
    code: row.code ?? '',
    sku: row.sku ?? undefined,
    title: row.title,
    short_title: row.shortTitle ?? undefined,
    description: row.description ?? undefined,
    short_description: row.shortDescription ?? undefined,
    price: parseFloat(row.price),
    discount_pct: row.discountPct ? parseFloat(row.discountPct) : undefined,
    discount_until: row.discountUntil instanceof Date ? row.discountUntil.toISOString() : (row.discountUntil ?? null),
    offer_price: computedOfferPrice,
    stock: row.stock,
    min_stock_alert: row.minStockAlert ?? undefined,
    category_id: row.categoryId ?? undefined,
    category: row.category ? {
      id: row.category.id,
      key: row.category.key,
      name: row.category.name,
      sort_order: row.category.sortOrder ?? 0,
      is_active: row.category.isActive ?? true,
    } : undefined,
    part_brand_id: row.partBrandId ?? undefined,
    part_brand: row.partBrand ? {
      id: row.partBrand.id,
      name: row.partBrand.name,
      logo_url: row.partBrand.logoUrl ?? undefined,
      is_active: row.partBrand.isActive ?? true,
    } : undefined,
    type: row.type as ProductType,
    slug: row.slug,
    meta_title: row.metaTitle ?? undefined,
    meta_description: row.metaDescription ?? undefined,
    is_featured: row.isFeatured ?? false,
    is_active: row.isActive ?? true,
    images: row.images?.map((img: any) => ({
      id: img.id,
      product_id: img.productId ?? 0,
      url: img.url,
      cloudinary_public_id: img.cloudinaryPublicId ?? undefined,
      alt_text: img.altText ?? undefined,
      is_primary: img.isPrimary ?? false,
      sort_order: img.sortOrder ?? 0,
    })),
    specs: row.specs?.map((s: any) => ({
      id: s.id,
      label: s.label,
      value: s.value,
      sort_order: s.sortOrder ?? undefined,
    })),
    alternate_codes: row.alternateCodes?.map((ac: any) => ({
      id: ac.id,
      product_id: ac.productId ?? 0,
      code: ac.code,
      source: ac.source ?? undefined,
    })),
    compatibilities: row.compatibilities?.map((c: any) => ({
      product_id: c.productId ?? 0,
      vehicle_model_id: c.vehicleModelId ?? 0,
      notes: c.notes ?? undefined,
      model: c.model ? {
        id: c.model.id,
        brand_id: c.model.brandId ?? 0,
        name: c.model.name,
        displacement: c.model.displacement ?? undefined,
        // yearStart/yearEnd live on the compatibility row, not the model
        year_start: c.yearStart ?? undefined,
        year_end: c.yearEnd ?? null,
        is_active: c.model.isActive ?? true,
        brand: c.model.brand ? {
          id: c.model.brand.id,
          name: c.model.brand.name,
          origin: c.model.brand.origin as VehicleOrigin,
          sort_order: c.model.brand.sortOrder ?? 0,
          is_active: c.model.brand.isActive ?? true,
        } : undefined,
      } : undefined,
    })),
    equivalencies: row.equivalencies?.map((eq: any) => toPublicProduct(eq)),
  }
}

export async function getPublicProducts(): Promise<Product[]> {
  const db = await getDb()
  const rows = await db.query.products.findMany({
    where: and(eq(products.isActive, true), buildNotDeletedWhere(products.deletedAt)),
    with: {
      category: true,
      partBrand: true,
      images: true,
      specs: true,
      alternateCodes: true,
      compatibilities: { with: { model: { with: { brand: true } } } },
    },
    orderBy: desc(products.createdAt),
  })
  return rows.map(r => toPublicProduct({
    ...r,
    offerPrice: offerPrice(r.price, r.discountPct, r.discountUntil),
  }))
}

export async function getPublicProductBySlug(slug: string): Promise<Product | null> {
  const row = await getProductBySlug(slug)
  if (!row) return null
  return toPublicProduct(row)
}

export async function getPublicProductByCode(code: string): Promise<Product | null> {
  const db = await getDb()
  const row = await db.query.products.findFirst({
    where: and(
      sql`lower(${products.code}) = lower(${code})`,
      eq(products.isActive, true),
      buildNotDeletedWhere(products.deletedAt),
    ),
    with: {
      category: true, partBrand: true, supplier: true, images: true,
      specs: true, alternateCodes: true,
      compatibilities: { with: { model: { with: { brand: true } } } },
    },
  })
  if (!row) return null
  const eqRows = await db.query.productEquivalencies.findMany({
    where: eq(productEquivalencies.productId, row.id),
    with: { equivalent: { with: { images: { where: eq(productImages.isPrimary, true) } } } },
  })
  return toPublicProduct({
    ...row,
    offerPrice: offerPrice(row.price, row.discountPct, row.discountUntil),
    equivalencies: eqRows.map(e => e.equivalent),
  })
}

export async function getPublicProductsByCategory(categoryKey: string, excludeId: number, limit = 4): Promise<Product[]> {
  const db = await getDb()
  // join through category to filter by key
  const catRows = await db.query.categories.findFirst({
    where: (cat, { eq: eqFn }) => eqFn(cat.key, categoryKey),
  })
  if (!catRows) return []
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      eq(products.categoryId, catRows.id),
      buildNotDeletedWhere(products.deletedAt),
      sql`${products.id} != ${excludeId}`,
    ),
    with: { category: true, partBrand: true, images: true },
    limit,
    orderBy: desc(products.createdAt),
  })
  return rows.map(r => toPublicProduct({ ...r, offerPrice: offerPrice(r.price, r.discountPct, r.discountUntil) }))
}
