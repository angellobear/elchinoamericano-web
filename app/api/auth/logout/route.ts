import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { jwtVerify } from 'jose'
import { revokeUserSessions } from '@/lib/db/users'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

// POST (no GET): cerrar sesión muta estado, así que no debe ser disparable
// desde un <img src> u otra petición de navegación de terceros.
export async function POST(req: NextRequest) {
  let origin = process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'http'
    const host = h.get('host') ?? 'localhost:3000'
    origin = `${proto}://${host}`
  }

  // Revoca todas las sesiones del usuario antes de borrar la cookie, para que
  // un token copiado deje de servir. Si el token no existe o no es válido,
  // simplemente limpiamos la cookie: cerrar sesión nunca debe fallar.
  const token = req.cookies.get('admin_token')?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.userId
      if (typeof userId === 'string' && userId) {
        await revokeUserSessions(userId)
      }
    } catch {
      // token inválido/expirado o fallo de base de datos: seguimos con el logout
    }
  }

  const res = NextResponse.redirect(new URL('/login', origin), { status: 303 })
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' })
  return res
}
