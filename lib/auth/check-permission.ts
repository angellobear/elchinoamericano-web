import 'server-only'

import { cache } from 'react'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import type { JWTPayload, ModulePermissions } from '@/types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

/**
 * Decide si un token debe considerarse revocado comparando su claim `iat`
 * contra la marca `users.sessions_revoked_at`.
 *
 * Ambos valores son epoch en SEGUNDOS producidos por el reloj de Node: el `iat`
 * lo pone `SignJWT().setIssuedAt()` al emitir el token y la marca la escribe
 * `revokeUserSessions` con `Math.floor(Date.now() / 1000)`. La columna es un
 * entero, no un TIMESTAMP, precisamente para que no haya conversión de zona
 * horaria entre la sesión de MySQL y el proceso Node: un desfase de zona hacia
 * el pasado haría que la revocación dejara de revocar en silencio (fail-open),
 * y hacia el futuro invalidaría sesiones legítimas.
 *
 * Reglas:
 * - Sin marca de revocación, el token nunca está revocado.
 * - Con marca de revocación y sin `iat`, se revoca (fail-closed): no hay forma
 *   de probar que el token se emitió después de la revocación.
 * - Con marca de revocación e `iat`, se revoca si fue emitido antes de ella.
 *
 * El `<` estricto es deliberado. Como ambos valores tienen precisión de un
 * segundo, un `<=` invalidaría el token de un re-login hecho dentro del mismo
 * segundo de la revocación. Se acepta a cambio una ventana residual de hasta un
 * segundo en la que un token emitido en ese mismo segundo sobrevive.
 *
 * NOTA: `scripts/check-session-revocation.mjs` es un espejo de esta función.
 * Si cambias una, cambia la otra.
 */
export function isTokenRevoked(iat: number | undefined, revokedAtEpoch: number | null): boolean {
  if (!revokedAtEpoch) return false
  if (typeof iat !== 'number' || !Number.isFinite(iat)) return true
  return iat < revokedAtEpoch
}

/**
 * Estado de sesión del usuario, leído de base de datos.
 * Se envuelve en `cache()` de React para que las múltiples llamadas a
 * `getJwtPayload()` dentro de un mismo request hagan una sola consulta.
 * Consulta incluyendo borrados para poder rechazarlos explícitamente.
 */
const loadSessionUser = cache(async (userId: string) => {
  const db = await getDb()
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, isActive: true, deletedAt: true, sessionsRevokedAt: true },
  })
})

export async function getJwtPayload(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null

  let payload: JWTPayload
  try {
    const verified = await jwtVerify(token, secret)
    payload = verified.payload as unknown as JWTPayload
  } catch {
    return null
  }

  if (!payload.userId) return null

  try {
    const user = await loadSessionUser(payload.userId)
    if (!user) return null
    if (user.deletedAt) return null
    if (!user.isActive) return null
    if (isTokenRevoked(payload.iat, user.sessionsRevokedAt ?? null)) return null
  } catch {
    // Fail-closed: si no podemos verificar el estado del usuario, no hay sesión.
    return null
  }

  return payload
}

// Throws if the current user lacks the required permission
export async function checkPermission(module: string, action: keyof ModulePermissions) {
  const payload = await getJwtPayload()
  if (!payload) throw new Error('Not authenticated')
  if (!payload.permissions[module]?.[action]) {
    throw new Error(`Permission denied: ${module}.${action}`)
  }
}
