import { randomUUID } from 'crypto'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { modules, rolePermissions, roles, sessions, users } from '@/lib/db/schema'
import type { JWTPayload, PermissionsMap } from '@/types'
import {
  ROTATION_GRACE_SECONDS,
  SESSION_TTL_DAYS,
  createRefreshSecret,
  formatRefreshCookie,
  hashRefreshSecret,
  parseRefreshCookie,
  sameHash,
  signAccessToken,
} from './tokens'

// Sesiones del admin en base de datos. Sin `server-only` ni lib/audit en la cadena de
// imports: lo usa proxy.ts y lo ejercita scripts/check-sessions.ts.

type Db = Awaited<ReturnType<typeof getDb>>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

export type RenewResult =
  /** Token vigente: se rotó. Hay que mandar las dos cookies nuevas. */
  | { status: 'rotated'; payload: JWTPayload; accessToken: string; refreshCookie: string }
  /** Petición en paralelo a una rotación reciente: solo token de acceso, la cookie de renovación no se toca. */
  | { status: 'grace'; payload: JWTPayload; accessToken: string }
  /** Sesión inexistente, vencida, revocada o token reutilizado: hay que borrar las cookies. */
  | { status: 'invalid' }

const expiry = sql`NOW() + INTERVAL ${SESSION_TTL_DAYS} DAY`

/** Lee el usuario y sus permisos tal como están ahora. `null` si ya no puede entrar. */
async function loadPayload(db: Db | Tx, userId: string, sid: string): Promise<JWTPayload | null> {
  const [user] = await db
    .select({ id: users.id, email: users.email, roleId: users.roleId, role: roles.name })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, userId), eq(users.isActive, true), isNull(users.deletedAt)))
  if (!user) return null

  const rows = user.roleId
    ? await db
        .select({
          key: modules.key,
          canView: rolePermissions.canView,
          canCreate: rolePermissions.canCreate,
          canEdit: rolePermissions.canEdit,
          canDelete: rolePermissions.canDelete,
        })
        .from(rolePermissions)
        .innerJoin(modules, eq(rolePermissions.moduleId, modules.id))
        .where(eq(rolePermissions.roleId, user.roleId))
    : []

  const permissions: PermissionsMap = {}
  for (const row of rows) {
    permissions[row.key] = {
      can_view: Boolean(row.canView),
      can_create: Boolean(row.canCreate),
      can_edit: Boolean(row.canEdit),
      can_delete: Boolean(row.canDelete),
    }
  }

  return { sid, userId: user.id, email: user.email, role: user.role ?? '', permissions }
}

/** Login correcto: abre una sesión para este dispositivo. `null` si el usuario no puede entrar. */
export async function createSession(userId: string, userAgent: string | null) {
  const db = await getDb()
  const id = randomUUID()
  const payload = await loadPayload(db, userId, id)
  if (!payload) return null

  const secret = createRefreshSecret()
  await db.insert(sessions).values({
    id,
    userId,
    tokenHash: hashRefreshSecret(secret),
    userAgent: userAgent?.slice(0, 255) ?? null,
    expiresAt: expiry,
  })

  return {
    payload,
    accessToken: await signAccessToken(payload),
    refreshCookie: formatRefreshCookie(id, secret),
  }
}

/**
 * Cambia un token de renovación por uno nuevo y emite un token de acceso con el usuario
 * y los permisos actuales. Si llega un token que ya fue rotado y está fuera del margen
 * de gracia, alguien más lo usó: se revoca la sesión entera.
 */
export async function renewSession(refreshCookie: string | undefined): Promise<RenewResult> {
  const parsed = parseRefreshCookie(refreshCookie)
  if (!parsed) return { status: 'invalid' }

  const presented = hashRefreshSecret(parsed.secret)
  const db = await getDb()

  return db.transaction(async (tx): Promise<RenewResult> => {
    // El reloj es el de la base, para no depender de la zona horaria del servidor.
    const [rows] = (await tx.execute(sql`
      SELECT user_id, token_hash, prev_token_hash,
             (revoked_at IS NULL AND expires_at > NOW()) AS alive,
             (rotated_at IS NOT NULL AND rotated_at >= NOW() - INTERVAL ${ROTATION_GRACE_SECONDS} SECOND) AS in_grace
      FROM sessions WHERE id = ${parsed.sessionId} FOR UPDATE
    `)) as unknown as [
      { user_id: string; token_hash: string; prev_token_hash: string | null; alive: number; in_grace: number }[],
    ]
    const session = rows[0]
    if (!session || !session.alive) return { status: 'invalid' }

    const revoke = async (): Promise<RenewResult> => {
      await tx.update(sessions).set({ revokedAt: sql`NOW()` }).where(eq(sessions.id, parsed.sessionId))
      return { status: 'invalid' }
    }

    const isCurrent = sameHash(presented, session.token_hash)
    const isPrevious = sameHash(presented, session.prev_token_hash)
    if (!isCurrent && !(isPrevious && session.in_grace)) return revoke()

    const payload = await loadPayload(tx, session.user_id, parsed.sessionId)
    // Usuario desactivado o eliminado: la sesión muere aquí.
    if (!payload) return revoke()

    const accessToken = await signAccessToken(payload)
    if (!isCurrent) return { status: 'grace', payload, accessToken }

    const secret = createRefreshSecret()
    await tx
      .update(sessions)
      .set({
        tokenHash: hashRefreshSecret(secret),
        prevTokenHash: session.token_hash,
        rotatedAt: sql`NOW()`,
        lastUsedAt: sql`NOW()`,
        expiresAt: expiry,
      })
      .where(eq(sessions.id, parsed.sessionId))

    return { status: 'rotated', payload, accessToken, refreshCookie: formatRefreshCookie(parsed.sessionId, secret) }
  })
}

/** Cierre de sesión. Exige el token (vigente o anterior) para que nadie cierre sesiones ajenas con solo el id. */
export async function revokeSession(refreshCookie: string | undefined) {
  const parsed = parseRefreshCookie(refreshCookie)
  if (!parsed) return

  const presented = hashRefreshSecret(parsed.secret)
  const db = await getDb()
  const [session] = await db
    .select({ tokenHash: sessions.tokenHash, prevTokenHash: sessions.prevTokenHash })
    .from(sessions)
    .where(eq(sessions.id, parsed.sessionId))
  if (!session) return
  if (!sameHash(presented, session.tokenHash) && !sameHash(presented, session.prevTokenHash)) return

  await db.update(sessions).set({ revokedAt: sql`NOW()` }).where(eq(sessions.id, parsed.sessionId))
}

/** Cierra todas las sesiones de un usuario: cambio de contraseña, desactivación o eliminación. */
export async function revokeUserSessions(userId: string) {
  const db = await getDb()
  await db
    .update(sessions)
    .set({ revokedAt: sql`NOW()` })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
}
