import { getDb } from './client'
import { vehicleBrands, vehicleModels } from './schema'
import { eq, asc } from 'drizzle-orm'

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
  const db = await getDb()
  const [row] = await db.insert(vehicleBrands).values(data).returning({ id: vehicleBrands.id })
  return row.id
}

export async function updateVehicleBrand(id: number, data: Partial<typeof vehicleBrands.$inferInsert>) {
  console.log('updateVehicleBrand', id, data)
  const db = await getDb()
  await db.update(vehicleBrands).set({ ...data, updatedAt: new Date() }).where(eq(vehicleBrands.id, id))
}

export async function deleteVehicleBrand(id: number) {
  const db = await getDb()
  await db.update(vehicleBrands).set({ isActive: false, updatedAt: new Date() }).where(eq(vehicleBrands.id, id))
}

export async function createVehicleModel(data: typeof vehicleModels.$inferInsert) {
  const db = await getDb()
  const [row] = await db.insert(vehicleModels).values(data).returning({ id: vehicleModels.id })
  return row.id
}

export async function updateVehicleModel(id: number, data: Partial<typeof vehicleModels.$inferInsert>) {
  const db = await getDb()
  await db.update(vehicleModels).set({ ...data, updatedAt: new Date() }).where(eq(vehicleModels.id, id))
}

export async function deleteVehicleModel(id: number) {
  const db = await getDb()
  await db.update(vehicleModels).set({ isActive: false, updatedAt: new Date() }).where(eq(vehicleModels.id, id))
}

export async function getVehicleBrandsWithModels() {
  const db = await getDb()
  return db.query.vehicleBrands.findMany({
    orderBy: asc(vehicleBrands.sortOrder),
    with: { models: { columns: { id: true } } },
  })
}
