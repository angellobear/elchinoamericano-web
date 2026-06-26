import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'
import { getDb } from '@/lib/db/client'
import { rolePermissions, modules, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { logActivitySafe, withAudit } from '@/lib/audit'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user?.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  // Build permissions map for this role
  const db = await getDb()
  const perms = await db
    .select({ key: modules.key, canView: rolePermissions.canView, canCreate: rolePermissions.canCreate, canEdit: rolePermissions.canEdit, canDelete: rolePermissions.canDelete })
    .from(rolePermissions)
    .innerJoin(modules, eq(rolePermissions.moduleId, modules.id))
    .where(eq(rolePermissions.roleId, user.roleId!))

  const permissions: Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }> = {}
  for (const p of perms) {
    permissions[p.key] = { can_view: p.canView!, can_create: p.canCreate!, can_edit: p.canEdit!, can_delete: p.canDelete! }
  }

  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role?.name ?? '', permissions })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret)

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
  res.cookies.set('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8 })
  return res
}
