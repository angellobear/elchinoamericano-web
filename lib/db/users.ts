import { getDb } from './client'
import { users, roles } from './schema'
import { and, eq, desc, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { dbNow } from './db-now'
import { withAudit } from '@/lib/audit'
import { buildNotDeletedWhere, type SoftDeleteQueryOptions } from '@/lib/db/soft-delete'

export async function getUsers(options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  return db.query.users.findMany({
    where: buildNotDeletedWhere(users.deletedAt, options),
    with: { role: true },
    orderBy: desc(users.createdAt),
  })
}

export async function getUserByEmail(email: string, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  return db.query.users.findFirst({
    where: and(eq(users.email, email), buildNotDeletedWhere(users.deletedAt, options)),
    with: { role: true },
  })
}

export async function getUserById(id: string, options?: SoftDeleteQueryOptions) {
  const db = await getDb()
  return db.query.users.findFirst({
    where: and(eq(users.id, id), buildNotDeletedWhere(users.deletedAt, options)),
    with: { role: true },
  })
}

export async function getRoles() {
  const db = await getDb()
  return db.query.roles.findMany({ orderBy: asc(roles.id) })
}

export async function createUser(data: { email: string; fullName?: string; password: string; roleId: number }) {
  const passwordHash = await bcrypt.hash(data.password, 12)
  await withAudit(async (tx) => {
    await tx.insert(users).values({
      id:           randomUUID(),
      email:        data.email,
      fullName:     data.fullName,
      passwordHash,
      roleId:       data.roleId,
    })
  })
}

export async function updateUser(id: string, data: { fullName?: string; roleId?: number; isActive?: boolean; passwordHash?: string; deletedAt?: Date | null | ReturnType<typeof dbNow> }) {
  await withAudit(async (tx) => {
    await tx.update(users).set({ ...data, updatedAt: dbNow() }).where(eq(users.id, id))
  })
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
