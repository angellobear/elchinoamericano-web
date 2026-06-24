import { getDb } from './client'
import { users, roles } from './schema'
import { eq, desc, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function getUsers() {
  const db = await getDb()
  return db.query.users.findMany({
    with: { role: true },
    orderBy: desc(users.createdAt),
  })
}

export async function getUserByEmail(email: string) {
  const db = await getDb()
  return db.query.users.findFirst({
    where: eq(users.email, email),
    with: { role: true },
  })
}

export async function getUserById(id: string) {
  const db = await getDb()
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: { role: true },
  })
}

export async function getRoles() {
  const db = await getDb()
  return db.query.roles.findMany({ orderBy: asc(roles.id) })
}

export async function createUser(data: { email: string; fullName?: string; password: string; roleId: number }) {
  const db = await getDb()
  const passwordHash = await bcrypt.hash(data.password, 12)
  await db.insert(users).values({
    id:           randomUUID(),
    email:        data.email,
    fullName:     data.fullName,
    passwordHash,
    roleId:       data.roleId,
  })
}

export async function updateUser(id: string, data: { fullName?: string; roleId?: number; isActive?: boolean; passwordHash?: string }) {
  const db = await getDb()
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id))
}

export async function deactivateUser(id: string) {
  return updateUser(id, { isActive: false })
}

export async function activateUser(id: string) {
  return updateUser(id, { isActive: true })
}
