import { and, count, desc, eq, gte, inArray, isNull, like, lt, or, sql } from 'drizzle-orm'
import { getDb } from './client'
import { inboxMessages, products } from './schema'
import { dbNow } from './db-now'
import { offerPrice } from './products'
import { logActivitySafe } from '@/lib/audit'
import { INBOX_PAGE_SIZE, normalizePhone, type InboxPayload, type InboxType, type PricedProduct } from '@/modules/inbox/schema'

export type InboxRow = typeof inboxMessages.$inferSelect

export interface InboxFilters {
  type?: InboxType
  unreadOnly?: boolean
  includeHidden?: boolean
  from: Date
  toExclusive: Date
  search?: string
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&')

function buildWhere(f: InboxFilters) {
  const term = f.search?.trim()
  return and(
    isNull(inboxMessages.deletedAt),
    gte(inboxMessages.createdAt, f.from),
    lt(inboxMessages.createdAt, f.toExclusive),
    f.type ? eq(inboxMessages.type, f.type) : undefined,
    f.unreadOnly ? isNull(inboxMessages.readAt) : undefined,
    f.includeHidden ? undefined : isNull(inboxMessages.hiddenAt),
    term
      ? or(
          like(inboxMessages.name, `%${escapeLike(term)}%`),
          like(inboxMessages.phone, `%${escapeLike(normalizePhone(term))}%`),
        )
      : undefined,
  )
}

export async function insertInboxMessage(values: {
  type: InboxType
  name: string
  phone: string
  payload: InboxPayload
  ip: string | null
}) {
  const db = await getDb()
  await db.insert(inboxMessages).values(values)
}

export async function countRecentByIp(ip: string, minutes: number) {
  const db = await getDb()
  const [row] = await db
    .select({ n: count() })
    .from(inboxMessages)
    .where(and(eq(inboxMessages.ip, ip), sql`${inboxMessages.createdAt} >= now() - interval ${minutes} minute`))
  return row?.n ?? 0
}

/** Precio vigente (con descuento activo) de productos activos y no eliminados. */
export async function getPricedProducts(ids: number[]): Promise<PricedProduct[]> {
  if (ids.length === 0) return []
  const db = await getDb()
  const rows = await db
    .select({
      id: products.id,
      code: products.code,
      title: products.title,
      slug: products.slug,
      price: products.price,
      discountPct: products.discountPct,
      discountUntil: products.discountUntil,
    })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.isActive, true), isNull(products.deletedAt)))

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    slug: r.slug,
    unitPrice: offerPrice(r.price, r.discountPct, r.discountUntil) ?? Number(r.price),
  }))
}

export async function listInbox(filters: InboxFilters, page: number) {
  const db = await getDb()
  const where = buildWhere(filters)
  const [rows, [totalRow]] = await Promise.all([
    db.select().from(inboxMessages).where(where)
      .orderBy(desc(inboxMessages.createdAt), desc(inboxMessages.id))
      .limit(INBOX_PAGE_SIZE)
      .offset((page - 1) * INBOX_PAGE_SIZE),
    db.select({ n: count() }).from(inboxMessages).where(where),
  ])
  return { rows, total: totalRow?.n ?? 0 }
}

/** Contador del badge: no leídos, no ocultos, no eliminados, sin filtro de fecha. */
export async function countUnread() {
  const db = await getDb()
  const [row] = await db
    .select({ n: count() })
    .from(inboxMessages)
    .where(and(isNull(inboxMessages.readAt), isNull(inboxMessages.hiddenAt), isNull(inboxMessages.deletedAt)))
  return row?.n ?? 0
}

export async function getInboxMessage(id: number) {
  const db = await getDb()
  return db.query.inboxMessages.findFirst({
    where: and(eq(inboxMessages.id, id), isNull(inboxMessages.deletedAt)),
  })
}

export async function setInboxRead(id: number, read: boolean) {
  const db = await getDb()
  await db.update(inboxMessages).set({ readAt: read ? dbNow() : null }).where(and(eq(inboxMessages.id, id), isNull(inboxMessages.deletedAt)))
}

export async function setInboxHidden(id: number, hidden: boolean) {
  const db = await getDb()
  await db.update(inboxMessages).set({ hiddenAt: hidden ? dbNow() : null }).where(and(eq(inboxMessages.id, id), isNull(inboxMessages.deletedAt)))
}

export async function softDeleteInboxMessage(id: number) {
  const db = await getDb()
  const before = await getInboxMessage(id)
  if (!before) return
  await db.update(inboxMessages).set({ deletedAt: dbNow() }).where(and(eq(inboxMessages.id, id), isNull(inboxMessages.deletedAt)))
  await logActivitySafe('DELETE', 'inbox_messages', id, before as Record<string, unknown>)
}

export async function markAllInboxRead(filters: InboxFilters) {
  const db = await getDb()
  await db.update(inboxMessages).set({ readAt: dbNow() })
    .where(and(buildWhere(filters), isNull(inboxMessages.readAt)))
}
