import { getDb } from './client'
import { categories } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'

export async function getCategories(includeInactive = false) {
  const db = await getDb()
  return db.query.categories.findMany({
    where: includeInactive ? undefined : eq(categories.isActive, true),
    orderBy: asc(categories.sortOrder),
  })
}

export async function createCategory(data: typeof categories.$inferInsert) {
  await withAudit(async (tx) => {
    await tx.insert(categories).values(data)
  })
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  await withAudit(async (tx) => {
    await tx.update(categories).set({ ...data, updatedAt: dbNow() }).where(eq(categories.id, id))
  })
}

export async function deleteCategory(id: number) {
  await withAudit(async (tx) => {
    await tx.update(categories).set({ isActive: false, updatedAt: dbNow() }).where(eq(categories.id, id))
  })
}
