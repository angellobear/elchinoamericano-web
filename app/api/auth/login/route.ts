import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { createSession } from '@/lib/auth/sessions'
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from '@/lib/auth/tokens'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user?.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  // Una sesión por dispositivo: token de acceso corto + token de renovación que rota.
  const session = await createSession(user.id, req.headers.get('user-agent'))
  if (!session) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

  const { before, after } = await withAudit(async (tx) => {
    const before = await tx.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { id: true, lastLoginAt: true },
    })
    await tx.update(users).set({ lastLoginAt: sql`now()` }).where(eq(users.id, user.id))
    const after = await tx.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { id: true, lastLoginAt: true },
    })
    return { before, after }
  })

  await logActivitySafe('UPDATE', 'users', user.id, before as Record<string, unknown> | undefined, after as Record<string, unknown> | undefined, { userId: user.id })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACCESS_COOKIE, session.accessToken, accessCookieOptions())
  res.cookies.set(REFRESH_COOKIE, session.refreshCookie, refreshCookieOptions())
  return res
}
