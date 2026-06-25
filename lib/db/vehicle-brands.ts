import { getDb } from './client'
import { vehicleBrands, vehicleModels } from './schema'
import { eq, asc, and } from 'drizzle-orm'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'
import {
  LEGACY_VISIBLE_VEHICLE_BRAND_NAMES,
  toVehicleBrandKey,
  type PublicVehicleBrand,
} from '@/lib/vehicle-brands-public'

export async function getVehicleBrands(includeInactive = false) {
  const db = await getDb()
  return db.query.vehicleBrands.findMany({
    where: includeInactive ? undefined : eq(vehicleBrands.isActive, true),
    orderBy: asc(vehicleBrands.sortOrder),
  })
}

export async function getVehicleBrandWithModels(brandId: number) {
  const db = await getDb()
  return db.query.vehicleBrands.findFirst({
    where: eq(vehicleBrands.id, brandId),
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
    with: { models: { orderBy: asc(vehicleModels.name) } },
  })
}

export async function getVehicleBrandById(brandId: number) {
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
    .where(eq(vehicleBrands.id, brandId))
    .limit(1)

  return rows[0] ?? null
}

export async function getVehicleModels(brandId?: number, includeInactive = false) {
  const db = await getDb()
  return db.query.vehicleModels.findMany({
    where: brandId
      ? eq(vehicleModels.brandId, brandId)
      : includeInactive ? undefined : eq(vehicleModels.isActive, true),
    with: { brand: true },
    orderBy: asc(vehicleModels.name),
  })
}

export async function createVehicleBrand(data: typeof vehicleBrands.$inferInsert) {
  return withAudit(async (tx) => {
    const [row] = await tx.insert(vehicleBrands).values(data).returning({ id: vehicleBrands.id })
    return row.id
  })
}

export async function updateVehicleBrand(id: number, data: Partial<typeof vehicleBrands.$inferInsert>) {
  await withAudit(async (tx) => {
    await tx.update(vehicleBrands).set({ ...data, updatedAt: dbNow() }).where(eq(vehicleBrands.id, id))
  })
}

export async function deleteVehicleBrand(id: number) {
  await withAudit(async (tx) => {
    await tx.update(vehicleBrands).set({ isActive: false, updatedAt: dbNow() }).where(eq(vehicleBrands.id, id))
  })
}

export async function createVehicleModel(data: typeof vehicleModels.$inferInsert) {
  return withAudit(async (tx) => {
    const [row] = await tx.insert(vehicleModels).values(data).returning({ id: vehicleModels.id })
    return row.id
  })
}

export async function updateVehicleModel(id: number, data: Partial<typeof vehicleModels.$inferInsert>) {
  await withAudit(async (tx) => {
    await tx.update(vehicleModels).set({ ...data, updatedAt: dbNow() }).where(eq(vehicleModels.id, id))
  })
}

export async function deleteVehicleModel(id: number) {
  await withAudit(async (tx) => {
    await tx.update(vehicleModels).set({ isActive: false, updatedAt: dbNow() }).where(eq(vehicleModels.id, id))
  })
}

export async function getVehicleBrandsWithModels() {
  const db = await getDb()
  return db.query.vehicleBrands.findMany({
    orderBy: asc(vehicleBrands.sortOrder),
    columns: {
      id: true,
      name: true,
      origin: true,
      sortOrder: true,
      isActive: true,
      isVisibleOnWeb: true,
    },
    with: { models: { columns: { id: true, name: true } } },
  })
}

export async function getVehicleBrandsForAdmin() {
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
      .orderBy(asc(vehicleBrands.sortOrder)),
    db
      .select({
        id: vehicleModels.id,
        brandId: vehicleModels.brandId,
      })
      .from(vehicleModels),
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
      ),
      orderBy: asc(vehicleBrands.sortOrder),
      columns: {
        id: true,
        name: true,
        origin: true,
      },
    })

    return brands.map((brand) => ({
      id: brand.id,
      key: toVehicleBrandKey(brand.name),
      name: brand.name,
      origin: brand.origin,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const missingVisibilityColumn =
      message.includes('is_visible_on_web') ||
      message.includes('isVisibleOnWeb')

    if (!missingVisibilityColumn) throw error

    const brands = await db.query.vehicleBrands.findMany({
      where: eq(vehicleBrands.isActive, true),
      orderBy: asc(vehicleBrands.sortOrder),
      columns: {
        id: true,
        name: true,
        origin: true,
      },
    })

    return brands
      .filter((brand) => LEGACY_VISIBLE_VEHICLE_BRAND_NAMES.includes(brand.name as typeof LEGACY_VISIBLE_VEHICLE_BRAND_NAMES[number]))
      .map((brand) => ({
        id: brand.id,
        key: toVehicleBrandKey(brand.name),
        name: brand.name,
        origin: brand.origin,
      }))
  }
}
