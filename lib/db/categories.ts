import { getDb } from './client'
import { categories } from './schema'
import { eq, asc } from 'drizzle-orm'
import { dbNow } from './db-now'

export async function getCategories(includeInactive = false) {
  const db = await getDb()
  return db.query.categories.findMany({
    where: includeInactive ? undefined : eq(categories.isActive, true),
    orderBy: asc(categories.sortOrder),
  })
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const db = await getDb()
  await db.insert(categories).values(data)
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb()
  await db.update(categories).set({ ...data, updatedAt: dbNow() }).where(eq(categories.id, id))
}

export async function deleteCategory(id: number) {
  const db = await getDb()
  await db.update(categories).set({ isActive: false, updatedAt: dbNow() }).where(eq(categories.id, id))
}
