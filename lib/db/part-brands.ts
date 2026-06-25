import { getDb } from './client'
import { partBrands } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'

export async function getPartBrands(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.partBrands.findMany({
    where: buildVisibilityWhere(partBrands.isActive, partBrands.deletedAt, includeInactiveOrOptions),
    orderBy: asc(partBrands.name),
  })
}

export async function createPartBrand(data: typeof partBrands.$inferInsert) {
  await withAudit(async (tx) => {
    await tx.insert(partBrands).values(data)
  })
}

export async function updatePartBrand(id: number, data: Partial<typeof partBrands.$inferInsert>) {
  await withAudit(async (tx) => {
    await tx.update(partBrands).set({ ...data, updatedAt: dbNow() }).where(eq(partBrands.id, id))
  })
}

export async function deletePartBrand(id: number) {
  await withAudit(async (tx) => {
    await tx.update(partBrands).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(partBrands.id, id))
  })
}
