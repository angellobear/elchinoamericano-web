import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { revokeSession } from '@/lib/auth/sessions'
import { ACCESS_COOKIE, REFRESH_COOKIE, clearedCookieOptions } from '@/lib/auth/tokens'
import { logger } from '@/lib/logger'

export async function GET() {
  let origin = process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'http'
    const host = h.get('host') ?? 'localhost:3000'
    origin = `${proto}://${host}`
  }

  // La sesión se cierra también en el servidor: el token de renovación deja de servir.
  try {
    await revokeSession((await cookies()).get(REFRESH_COOKIE)?.value)
  } catch (err) {
    logger.error({ err }, 'No se pudo revocar la sesión al cerrar sesión')
  }

  const res = NextResponse.redirect(new URL('/login', origin))
  res.cookies.set(ACCESS_COOKIE, '', clearedCookieOptions())
  res.cookies.set(REFRESH_COOKIE, '', clearedCookieOptions())
  return res
}
