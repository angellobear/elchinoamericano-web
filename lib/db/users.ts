import { getDb } from './client'
import { users, roles } from './schema'
import { and, eq, desc, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
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

/**
 * Epoch en SEGUNDOS tomado del reloj de Node — el mismo que emite el claim `iat`
 * del JWT. Deliberadamente NO usa `dbNow()` (`now()` de MySQL): esa marca vendría
 * del reloj y la zona horaria del servidor MySQL y se compararía contra un `iat`
 * en epoch UTC de Node, así que cualquier desfase de zona desplazaría la
 * comparación varias horas y la revocación dejaría de revocar en silencio.
 */
function revokedAtEpochNow() {
  return Math.floor(Date.now() / 1000)
}

/**
 * Revoca todas las sesiones activas del usuario: cualquier JWT emitido antes de
 * este instante deja de ser válido (ver isTokenRevoked en lib/auth/check-permission).
 */
export async function revokeUserSessions(id: string) {
  const db = await getDb()
  await db.update(users).set({ sessionsRevokedAt: revokedAtEpochNow() }).where(eq(users.id, id))
}

/**
 * Un cambio de estado sensible (desactivar, cambiar de rol, cambiar contraseña)
 * debe invalidar los tokens ya emitidos, porque llevan rol y permisos embebidos.
 */
function shouldRevokeSessions(
  before: { isActive: boolean | null; roleId: number | null; passwordHash: string } | undefined,
  data: { roleId?: number; isActive?: boolean; passwordHash?: string },
) {
  if (data.isActive === false && before?.isActive !== false) return true
  if (data.roleId !== undefined && data.roleId !== before?.roleId) return true
  if (data.passwordHash !== undefined && data.passwordHash !== before?.passwordHash) return true
  return false
}

export async function updateUser(id: string, data: { fullName?: string; roleId?: number; isActive?: boolean; passwordHash?: string; deletedAt?: Date | null | ReturnType<typeof dbNow> }) {
  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.users.findFirst({ where: eq(users.id, id) })
    const revoke = shouldRevokeSessions(before, data)
    await tx
      .update(users)
      .set({ ...data, updatedAt: dbNow(), ...(revoke ? { sessionsRevokedAt: revokedAtEpochNow() } : {}) })
      .where(eq(users.id, id))
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
