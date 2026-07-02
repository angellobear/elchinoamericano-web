import 'server-only'

import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { JWTPayload, ModulePermissions } from '@/types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function getJwtPayload(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Throws if the current user lacks the required permission
export async function checkPermission(module: string, action: keyof ModulePermissions) {
  const payload = await getJwtPayload()
  if (!payload) throw new Error('Not authenticated')
  if (!payload.permissions[module]?.[action]) {
    throw new Error(`Permission denied: ${module}.${action}`)
  }
}
