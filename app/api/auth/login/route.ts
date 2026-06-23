import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'
import { getDb } from '@/lib/db/client'
import { rolePermissions, modules, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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

  const permissions: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {}
  for (const p of perms) {
    permissions[p.key] = { canView: p.canView!, canCreate: p.canCreate!, canEdit: p.canEdit!, canDelete: p.canDelete! }
  }

  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role?.name ?? '', permissions })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret)

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8 })
  return res
}
