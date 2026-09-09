import { getDb } from './client'
import { announcements } from './schema'
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { buildVisibilityWhere, type ActiveQueryOptions } from '@/lib/db/soft-delete'
import { todayInEcuador } from '@/lib/today-ecuador'

export async function getAnnouncements(includeInactiveOrOptions: boolean | ActiveQueryOptions = false) {
  const db = await getDb()
  return db.query.announcements.findMany({
    where: buildVisibilityWhere(announcements.isActive, announcements.deletedAt, includeInactiveOrOptions),
    orderBy: desc(announcements.startsAt),
  })
}

export async function getAnnouncementById(id: number) {
  const db = await getDb()
  return db.query.announcements.findFirst({ where: eq(announcements.id, id) })
}

/** Anuncio vigente hoy. Si hay varios, gana el de inicio más reciente. */
export async function getActiveAnnouncement() {
  const db = await getDb()
  const today = todayInEcuador()

  return db.query.announcements.findFirst({
    where: and(
      eq(announcements.isActive, true),
      isNull(announcements.deletedAt),
      lte(announcements.startsAt, today),
      gte(announcements.endsAt, today),
    ),
    orderBy: desc(announcements.startsAt),
  })
}

export async function createAnnouncement(data: typeof announcements.$inferInsert) {
  const created = await withAudit(async (tx) => {
    const [result] = await tx.insert(announcements).values(data)
    return tx.query.announcements.findFirst({ where: eq(announcements.id, result.insertId) })
  })

  await logActivitySafe('CREATE', 'announcements', created?.id, undefined, created as Record<string, unknown> | undefined)
}

export async function updateAnnouncement(id: number, data: Partial<typeof announcements.$inferInsert>) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.announcements.findFirst({ where: eq(announcements.id, id) })
    await tx.update(announcements).set({ ...data, updatedAt: dbNow() }).where(eq(announcements.id, id))
    const after = await tx.query.announcements.findFirst({ where: eq(announcements.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'announcements', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deleteAnnouncement(id: number) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.announcements.findFirst({ where: eq(announcements.id, id) })
    await tx.update(announcements).set({ isActive: false, deletedAt: dbNow(), updatedAt: dbNow() }).where(eq(announcements.id, id))
    const after = await tx.query.announcements.findFirst({ where: eq(announcements.id, id) })
    return { before, after }
  })

  await logActivitySafe('DELETE', 'announcements', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}
