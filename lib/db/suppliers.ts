import { getDb } from './client'
import { suppliers } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'

export async function getSuppliers(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.suppliers.findMany({
    where: buildVisibilityWhere(suppliers.isActive, suppliers.deletedAt, includeInactiveOrOptions),
    orderBy: asc(suppliers.name),
  })
}

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  await withAudit(async (tx) => {
    await tx.insert(suppliers).values(data)
  })
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  await withAudit(async (tx) => {
    await tx.update(suppliers).set({ ...data, updatedAt: dbNow() }).where(eq(suppliers.id, id))
  })
}

export async function deleteSupplier(id: number) {
  await withAudit(async (tx) => {
    await tx.update(suppliers).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(suppliers.id, id))
  })
}
