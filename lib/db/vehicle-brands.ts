import { getDb } from './client'
import { vehicleBrands, vehicleModels } from './schema'
import { eq, asc, and } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import {
  LEGACY_VISIBLE_VEHICLE_BRAND_NAMES,
  toVehicleBrandKey,
  type PublicVehicleBrand,
} from '@/lib/vehicle-brands-public'
import {
  buildNotDeletedWhere,
  buildVisibilityWhere,
  type ActiveQueryOptions,
  type SoftDeleteQueryOptions,
} from '@/lib/db/soft-delete'

export async function getVehicleBrands(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.vehicleBrands.findMany({
    where: buildVisibilityWhere(vehicleBrands.isActive, vehicleBrands.deletedAt, includeInactiveOrOptions),
    orderBy: asc(vehicleBrands.sortOrder),
  })
}

export async function getVehicleBrandWithModels(brandId: number, options?: ActiveQueryOptions) {
  const db = await getDb()
  return db.query.vehicleBrands.findFirst({
    where: and(
      eq(vehicleBrands.id, brandId),
      buildVisibilityWhere(vehicleBrands.isActive, vehicleBrands.deletedAt, options),
    ),
    columns: {
      id: true,
      name: true,
      origin: true,
      logoUrl: true,
      logoPublicId: true,
      sortOrder: true,
      isActive: true,
      isVisibleOnWeb: true,
    },
    with: {
      models: {
        where: buildVisibilityWhere(vehicleModels.isActive, vehicleModels.deletedAt, options),
        orderBy: asc(vehicleModels.name),
      },
    },
  })
}

export async function getVehicleBrandById(brandId: number, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const rows = await db
    .select({
      id: vehicleBrands.id,
      name: vehicleBrands.name,
      origin: vehicleBrands.origin,
      logoUrl: vehicleBrands.logoUrl,
      logoPublicId: vehicleBrands.logoPublicId,
      sortOrder: vehicleBrands.sortOrder,
      isActive: vehicleBrands.isActive,
      isVisibleOnWeb: vehicleBrands.isVisibleOnWeb,
    })
    .from(vehicleBrands)
    .where(and(eq(vehicleBrands.id, brandId), buildNotDeletedWhere(vehicleBrands.deletedAt, options)))
    .limit(1)

  return rows[0] ?? null
}

export async function getVehicleModels(brandId?: number, includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.vehicleModels.findMany({
    where: and(
      brandId ? eq(vehicleModels.brandId, brandId) : undefined,
      buildVisibilityWhere(vehicleModels.isActive, vehicleModels.deletedAt, includeInactiveOrOptions),
    ),
    with: { brand: true },
    orderBy: asc(vehicleModels.name),
  })
}

export async function createVehicleBrand(data: typeof vehicleBrands.$inferInsert) {
  const { id, created } = await withAudit(async (tx) => {
    const result = await tx.insert(vehicleBrands).values(data)
    const insertId = Array.isArray(result)
      ? (result[0] as { insertId?: number } | undefined)?.insertId
      : (result as { insertId?: number }).insertId

    if (!insertId) {
      throw new Error('No se pudo obtener el ID de la marca creada.')
    }

    const id = Number(insertId)
    const created = await tx.query.vehicleBrands.findFirst({ where: eq(vehicleBrands.id, id) })
    return { id, created }
  })

  await logActivitySafe('CREATE', 'vehicle_brands', id, undefined, created as Record<string, unknown> | undefined)
  return id
}

export async function updateVehicleBrand(id: number, data: Partial<typeof vehicleBrands.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.vehicleBrands.findFirst({ where: eq(vehicleBrands.id, id) })
    await tx.update(vehicleBrands).set({ ...data, updatedAt: dbNow() }).where(eq(vehicleBrands.id, id))
    const after = await tx.query.vehicleBrands.findFirst({ where: eq(vehicleBrands.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'vehicle_brands', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteVehicleBrand(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.vehicleBrands.findFirst({ where: eq(vehicleBrands.id, id) })
    await tx.update(vehicleBrands).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(vehicleBrands.id, id))
    const after = await tx.query.vehicleBrands.findFirst({ where: eq(vehicleBrands.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'vehicle_brands', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function createVehicleModel(data: typeof vehicleModels.$inferInsert) {
  const { id, created } = await withAudit(async (tx) => {
    const result = await tx.insert(vehicleModels).values(data)
    const insertId = Array.isArray(result)
      ? (result[0] as { insertId?: number } | undefined)?.insertId
      : (result as { insertId?: number }).insertId

    if (!insertId) {
      throw new Error('No se pudo obtener el ID del modelo creado.')
    }

    const id = Number(insertId)
    const created = await tx.query.vehicleModels.findFirst({ where: eq(vehicleModels.id, id) })
    return { id, created }
  })

  await logActivitySafe('CREATE', 'vehicle_models', id, undefined, created as Record<string, unknown> | undefined)
  return id
}

export async function updateVehicleModel(id: number, data: Partial<typeof vehicleModels.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.vehicleModels.findFirst({ where: eq(vehicleModels.id, id) })
    await tx.update(vehicleModels).set({ ...data, updatedAt: dbNow() }).where(eq(vehicleModels.id, id))
    const after = await tx.query.vehicleModels.findFirst({ where: eq(vehicleModels.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'vehicle_models', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteVehicleModel(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.vehicleModels.findFirst({ where: eq(vehicleModels.id, id) })
    await tx.update(vehicleModels).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(vehicleModels.id, id))
    const after = await tx.query.vehicleModels.findFirst({ where: eq(vehicleModels.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'vehicle_models', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function getVehicleBrandsWithModels(options?: ActiveQueryOptions) {
  const db = await getDb()
  return db.query.vehicleBrands.findMany({
    where: buildVisibilityWhere(vehicleBrands.isActive, vehicleBrands.deletedAt, options),
    orderBy: asc(vehicleBrands.sortOrder),
    columns: {
      id: true,
      name: true,
      origin: true,
      sortOrder: true,
      isActive: true,
      isVisibleOnWeb: true,
    },
    with: {
      models: {
        where: buildVisibilityWhere(vehicleModels.isActive, vehicleModels.deletedAt, options),
        columns: { id: true, name: true },
      },
    },
  })
}

export async function getVehicleBrandsForAdmin(options?: ActiveQueryOptions) {
  const db = await getDb()
  const [brands, models] = await Promise.all([
    db
      .select({
        id: vehicleBrands.id,
        name: vehicleBrands.name,
        origin: vehicleBrands.origin,
        sortOrder: vehicleBrands.sortOrder,
        isActive: vehicleBrands.isActive,
        isVisibleOnWeb: vehicleBrands.isVisibleOnWeb,
      })
      .from(vehicleBrands)
      .where(buildVisibilityWhere(vehicleBrands.isActive, vehicleBrands.deletedAt, options))
      .orderBy(asc(vehicleBrands.sortOrder)),
    db
      .select({
        id: vehicleModels.id,
        brandId: vehicleModels.brandId,
      })
      .from(vehicleModels)
      .where(buildVisibilityWhere(vehicleModels.isActive, vehicleModels.deletedAt, options)),
  ])

  return brands.map((brand) => ({
    ...brand,
    models: models.filter((model) => model.brandId === brand.id).map((model) => ({ id: model.id })),
  }))
}

export async function getVisibleVehicleBrands(): Promise<PublicVehicleBrand[]> {
  const db = await getDb()
  try {
    const brands = await db.query.vehicleBrands.findMany({
      where: and(
        eq(vehicleBrands.isActive, true),
        eq(vehicleBrands.isVisibleOnWeb, true),
        buildNotDeletedWhere(vehicleBrands.deletedAt),
      ),
      orderBy: asc(vehicleBrands.sortOrder),
      columns: {
        id: true,
        name: true,
        origin: true,
        logoUrl: true,
        sortOrder: true,
      },
    })

    return brands.map((brand) => ({
      id: brand.id,
      key: toVehicleBrandKey(brand.name),
      name: brand.name,
      origin: brand.origin,
      logoUrl: brand.logoUrl ?? null,
      sortOrder: brand.sortOrder ?? 0,
      image: {
        url: brand.logoUrl ?? null,
      },
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const missingVisibilityColumn =
      message.includes('is_visible_on_web') ||
      message.includes('isVisibleOnWeb')

    if (!missingVisibilityColumn) throw error

    const brands = await db.query.vehicleBrands.findMany({
      where: and(eq(vehicleBrands.isActive, true), buildNotDeletedWhere(vehicleBrands.deletedAt)),
      orderBy: asc(vehicleBrands.sortOrder),
      columns: {
        id: true,
        name: true,
        origin: true,
        logoUrl: true,
        sortOrder: true,
      },
    })

    return brands
      .filter((brand) => LEGACY_VISIBLE_VEHICLE_BRAND_NAMES.includes(brand.name as typeof LEGACY_VISIBLE_VEHICLE_BRAND_NAMES[number]))
      .map((brand) => ({
        id: brand.id,
        key: toVehicleBrandKey(brand.name),
        name: brand.name,
        origin: brand.origin,
        logoUrl: brand.logoUrl ?? null,
        sortOrder: brand.sortOrder ?? 0,
        image: {
          url: brand.logoUrl ?? null,
        },
      }))
  }
}
