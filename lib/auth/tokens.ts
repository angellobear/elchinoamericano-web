import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '@/types'

// Sesión del admin: un token de acceso corto (JWT) + un token de renovación largo que
// vive en la tabla `sessions`. Sin imports de Next ni de la base: lo usan proxy.ts,
// las rutas de auth y los scripts de verificación.

export const ACCESS_COOKIE = 'admin_token'
export const REFRESH_COOKIE = 'admin_refresh'

/** Lo que dura un token de acceso robado. */
export const ACCESS_TTL_SECONDS = 15 * 60
/** La sesión se alarga este tiempo cada vez que se renueva; sin uso, caduca. */
export const SESSION_TTL_DAYS = 30
/** Tras rotar, el token anterior aún sirve este rato para peticiones que iban en paralelo. */
export const ROTATION_GRACE_SECONDS = 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const SECRET = /^[A-Za-z0-9_-]{43}$/

// Lectura perezosa: los scripts cargan .env.local después de importar este módulo.
function jwtSecret() {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error('JWT_SECRET no está definido.')
  return new TextEncoder().encode(value)
}

export async function signAccessToken(payload: JWTPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(jwtSecret())
}

export async function verifyAccessToken(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ['HS256'] })
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/** 256 bits aleatorios. En la base solo se guarda su hash. */
export function createRefreshSecret() {
  return randomBytes(32).toString('base64url')
}

export function hashRefreshSecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex')
}

export function sameHash(a: string, b: string | null | undefined) {
  if (!b || a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function formatRefreshCookie(sessionId: string, secret: string) {
  return `${sessionId}.${secret}`
}

export function parseRefreshCookie(value: string | undefined) {
  if (!value) return null
  const [sessionId, secret, ...rest] = value.split('.')
  if (rest.length > 0 || !UUID.test(sessionId ?? '') || !SECRET.test(secret ?? '')) return null
  return { sessionId, secret }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  }
}

export const accessCookieOptions = () => cookieOptions(ACCESS_TTL_SECONDS)
export const refreshCookieOptions = () => cookieOptions(SESSION_TTL_DAYS * 24 * 60 * 60)
export const clearedCookieOptions = () => cookieOptions(0)
