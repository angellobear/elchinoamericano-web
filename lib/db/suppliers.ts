import { getDb } from './client'
import { suppliers } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'

export async function getSuppliers(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.suppliers.findMany({
    where: buildVisibilityWhere(suppliers.isActive, suppliers.deletedAt, includeInactiveOrOptions),
    orderBy: asc(suppliers.name),
  })
}

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const created = await withAudit(async (tx) => {
    await tx.insert(suppliers).values(data)
    return tx.query.suppliers.findFirst({
      where: eq(suppliers.name, data.name),
    })
  })

  await logActivitySafe('CREATE', 'suppliers', created?.id, undefined, created as Record<string, unknown> | undefined)
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.suppliers.findFirst({ where: eq(suppliers.id, id) })
    await tx.update(suppliers).set({ ...data, updatedAt: dbNow() }).where(eq(suppliers.id, id))
    const after = await tx.query.suppliers.findFirst({ where: eq(suppliers.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'suppliers', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteSupplier(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.suppliers.findFirst({ where: eq(suppliers.id, id) })
    await tx.update(suppliers).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(suppliers.id, id))
    const after = await tx.query.suppliers.findFirst({ where: eq(suppliers.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'suppliers', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}
