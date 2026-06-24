import { getDb } from './client'
import {
  products, productImages, productSpecs, productAlternateCodes,
  productEquivalencies, productCompatibilities, stockMovements,
} from './schema'
import { eq, desc, like, and, sql } from 'drizzle-orm'

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
}) {
  const db = await getDb()
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.isActive, filters?.isActive ?? true),
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
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
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

export async function getProductById(id: number) {
  const db = await getDb()
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with:  {
      category: true, partBrand: true, images: true, specs: true, alternateCodes: true,
      compatibilities: { with: { vehicleModel: { with: { brand: true } } } },
    },
  })
  if (!row) return null
  return { ...row, offerPrice: offerPrice(row.price, row.discountPct, row.discountUntil) }
}

// For admin inventory page
export async function getInventory() {
  const db = await getDb()
  return db.query.products.findMany({
    where: eq(products.isActive, true),
    columns: { id: true, code: true, title: true, stock: true, minStockAlert: true, isActive: true },
    with: { category: { columns: { name: true } } },
    orderBy: products.stock,
  })
}

// For admin product list
export async function getProductList(search?: string) {
  const db = await getDb()
  return db.query.products.findMany({
    where: search
      ? sql`lower(${products.title}) like lower(${'%' + search + '%'})`
      : undefined,
    with: { category: true, partBrand: true },
    orderBy: desc(products.createdAt),
    limit: 100,
  })
}

// For admin dashboard stats
export async function getProductStats() {
  const db = await getDb()
  const [all, outOfStock, lowStock] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), eq(products.stock, 0))),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), sql`${products.stock} <= ${products.minStockAlert}`, sql`${products.stock} > 0`)),
  ])
  return {
    total:      Number(all[0]?.count ?? 0),
    outOfStock: Number(outOfStock[0]?.count ?? 0),
    lowStock:   Number(lowStock[0]?.count ?? 0),
  }
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb()
  const [row] = await db.insert(products).values(data).returning({ id: products.id })
  const code = `CA-${String(row.id).padStart(4, '0')}`
  await db.update(products).set({ code }).where(eq(products.id, row.id))
  return { id: row.id, code }
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb()
  await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id))
}

export async function deleteProduct(id: number) {
  const db = await getDb()
  await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id))
}

// ─── Relations (replace-all pattern) ─────────────────────────────────────────

export async function setAlternateCodes(productId: number, codes: { code: string; source?: string }[]) {
  const db = await getDb()
  await db.delete(productAlternateCodes).where(eq(productAlternateCodes.productId, productId))
  if (codes.length) await db.insert(productAlternateCodes).values(codes.map(c => ({ ...c, productId })))
}

export async function setEquivalencies(productId: number, equivalentIds: number[]) {
  const db = await getDb()
  await db.delete(productEquivalencies).where(eq(productEquivalencies.productId, productId))
  await db.delete(productEquivalencies).where(eq(productEquivalencies.equivalentId, productId))
  if (!equivalentIds.length) return
  // Both directions so queries from either side work
  await db.insert(productEquivalencies).values(
    equivalentIds.flatMap(eId => [
      { productId, equivalentId: eId },
      { productId: eId, equivalentId: productId },
    ])
  )
}

export async function setCompatibilities(productId: number, entries: { vehicleModelId: number; yearStart?: number; yearEnd?: number; notes?: string }[]) {
  const db = await getDb()
  await db.delete(productCompatibilities).where(eq(productCompatibilities.productId, productId))
  if (entries.length) await db.insert(productCompatibilities).values(entries.map(e => ({ ...e, productId })))
}

export async function setSpecs(productId: number, specs: { label: string; value: string; sortOrder?: number }[]) {
  const db = await getDb()
  await db.delete(productSpecs).where(eq(productSpecs.productId, productId))
  if (specs.length) await db.insert(productSpecs).values(specs.map((s, i) => ({ ...s, productId, sortOrder: s.sortOrder ?? i })))
}

export async function setImages(
  productId: number,
  images: { url: string; cloudinaryPublicId?: string | null; altText?: string; isPrimary: boolean; sortOrder: number }[]
) {
  const db = await getDb()
  await db.delete(productImages).where(eq(productImages.productId, productId))
  if (images.length) await db.insert(productImages).values(images.map(img => ({ ...img, productId })))
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export async function updateStock(productId: number, newStock: number, userId: string, reason?: string) {
  const db = await getDb()
  const current = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { stock: true },
  })
  await db.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, productId))
  await db.insert(stockMovements).values({
    productId,
    quantity:     newStock - (current?.stock ?? 0),
    movementType: 'adjustment',
    reason,
    userId,
  })
}
