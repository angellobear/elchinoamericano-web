import { getDb } from './client'
import { vehicleBrands, vehicleModels } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'

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
    with: { models: { orderBy: asc(vehicleModels.name) } },
  })
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
    with: { models: { columns: { id: true, name: true } } },
  })
}
