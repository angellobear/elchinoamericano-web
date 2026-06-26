import { getDb } from './client'
import { users, roles } from './schema'
import { and, eq, desc, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { buildNotDeletedWhere, type SoftDeleteQueryOptions } from '@/lib/db/soft-delete'

type UserWithRoleRow = {
  user: typeof users.$inferSelect
  role: typeof roles.$inferSelect | null
}

function mapUserWithRole(row: UserWithRoleRow) {
  return {
    ...row.user,
    role: row.role,
  }
}

function mapNullableUserWithRole(row?: UserWithRoleRow | null) {
  return row ? mapUserWithRole(row) : undefined
}

export async function getUsers(options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const rows = await db
    .select({
      user: users,
      role: roles,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(buildNotDeletedWhere(users.deletedAt, options))
    .orderBy(desc(users.createdAt))

  return rows.map(mapUserWithRole)
}

export async function getUserByEmail(email: string, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const row = await db
    .select({
      user: users,
      role: roles,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.email, email), buildNotDeletedWhere(users.deletedAt, options)))
    .limit(1)

  return mapNullableUserWithRole(row[0])
}

export async function getUserById(id: string, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  const row = await db
    .select({
      user: users,
      role: roles,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, id), buildNotDeletedWhere(users.deletedAt, options)))
    .limit(1)

  return mapNullableUserWithRole(row[0])
}

export async function getRoles() {
  const db = await getDb()
  return db.query.roles.findMany({ orderBy: asc(roles.id) })
}

export async function createUser(data: { email: string; fullName?: string; password: string; roleId: number }) {
  const passwordHash = await bcrypt.hash(data.password, 12)
  const created = await withAudit(async (tx) => {
    const id = randomUUID()
    await tx.insert(users).values({
      id,
      email:        data.email,
      fullName:     data.fullName,
      passwordHash,
      roleId:       data.roleId,
    })
    return tx.query.users.findFirst({ where: eq(users.id, id) })
  })

  await logActivitySafe('CREATE', 'users', created?.id, undefined, created as Record<string, unknown> | undefined)
}

export async function updateUser(id: string, data: { fullName?: string; roleId?: number; isActive?: boolean; passwordHash?: string; deletedAt?: Date | null | ReturnType<typeof dbNow> }) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.users.findFirst({ where: eq(users.id, id) })
    await tx.update(users).set({ ...data, updatedAt: dbNow() }).where(eq(users.id, id))
    const after = await tx.query.users.findFirst({ where: eq(users.id, id) })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'users', id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined)
}

export async function deactivateUser(id: string) {
  return updateUser(id, { isActive: false })
}

export async function activateUser(id: string) {
  return updateUser(id, { isActive: true })
}

export async function deleteUser(id: string) {
  return updateUser(id, { isActive: false, deletedAt: dbNow() })
}
