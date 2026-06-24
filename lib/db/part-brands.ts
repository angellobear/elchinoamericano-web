import { getDb } from './client'
import { partBrands } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'

export async function getPartBrands(includeInactive = false) {
  const db = await getDb()
  return db.query.partBrands.findMany({
    where: includeInactive ? undefined : eq(partBrands.isActive, true),
    orderBy: asc(partBrands.name),
  })
}

export async function createPartBrand(data: typeof partBrands.$inferInsert) {
  const db = await getDb()
  await db.insert(partBrands).values(data)
}

export async function updatePartBrand(id: number, data: Partial<typeof partBrands.$inferInsert>) {
  const db = await getDb()
  await db.update(partBrands).set({ ...data, updatedAt: dbNow() }).where(eq(partBrands.id, id))
}

export async function deletePartBrand(id: number) {
  const db = await getDb()
  await db.update(partBrands).set({ isActive: false, updatedAt: dbNow() }).where(eq(partBrands.id, id))
}
