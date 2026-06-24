import { getDb } from './client'
import { suppliers } from './schema'
import { eq, asc } from 'drizzle-orm'

export async function getSuppliers(includeInactive = false) {
  const db = await getDb()
  return db.query.suppliers.findMany({
    where: includeInactive ? undefined : eq(suppliers.isActive, true),
    orderBy: asc(suppliers.name),
  })
}

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const db = await getDb()
  await db.insert(suppliers).values(data)
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const db = await getDb()
  await db.update(suppliers).set({ ...data, updatedAt: new Date() }).where(eq(suppliers.id, id))
}

export async function deleteSupplier(id: number) {
  const db = await getDb()
  await db.update(suppliers).set({ isActive: false, updatedAt: new Date() }).where(eq(suppliers.id, id))
}
