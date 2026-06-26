import { getDb } from './client'
import { partBrands } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'

export async function getPartBrands(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.partBrands.findMany({
    where: buildVisibilityWhere(partBrands.isActive, partBrands.deletedAt, includeInactiveOrOptions),
    orderBy: asc(partBrands.name),
  })
}

export async function createPartBrand(data: typeof partBrands.$inferInsert) {
  const created = await withAudit(async (tx) => {
    await tx.insert(partBrands).values(data)
    return tx.query.partBrands.findFirst({
      where: eq(partBrands.name, data.name),
    })
  })

  await logActivitySafe('CREATE', 'part_brands', created?.id, undefined, created as Record<string, unknown> | undefined)
}

export async function updatePartBrand(id: number, data: Partial<typeof partBrands.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.partBrands.findFirst({ where: eq(partBrands.id, id) })
    await tx.update(partBrands).set({ ...data, updatedAt: dbNow() }).where(eq(partBrands.id, id))
    const after = await tx.query.partBrands.findFirst({ where: eq(partBrands.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'part_brands', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deletePartBrand(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.partBrands.findFirst({ where: eq(partBrands.id, id) })
    await tx.update(partBrands).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(partBrands.id, id))
    const after = await tx.query.partBrands.findFirst({ where: eq(partBrands.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'part_brands', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}
