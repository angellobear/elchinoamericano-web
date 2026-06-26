import { getDb } from './client'
import { categories } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'

export async function getCategories(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.categories.findMany({
    where: buildVisibilityWhere(categories.isActive, categories.deletedAt, includeInactiveOrOptions),
    orderBy: asc(categories.sortOrder),
  })
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const created = await withAudit(async (tx) => {
    await tx.insert(categories).values(data)
    return tx.query.categories.findFirst({
      where: eq(categories.key, data.key),
    })
  })

  await logActivitySafe('CREATE', 'categories', created?.id, undefined, created as Record<string, unknown> | undefined)
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.categories.findFirst({ where: eq(categories.id, id) })
    await tx.update(categories).set({ ...data, updatedAt: dbNow() }).where(eq(categories.id, id))
    const after = await tx.query.categories.findFirst({ where: eq(categories.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'categories', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteCategory(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.categories.findFirst({ where: eq(categories.id, id) })
    await tx.update(categories).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(categories.id, id))
    const after = await tx.query.categories.findFirst({ where: eq(categories.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'categories', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}
