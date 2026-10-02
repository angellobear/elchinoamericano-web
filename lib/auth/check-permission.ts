import 'server-only'

import { cookies } from 'next/headers'
import type { JWTPayload, ModulePermissions } from '@/types'
import { ACCESS_COOKIE, verifyAccessToken } from './tokens'

// La renovación de la sesión ocurre en proxy.ts; aquí solo se lee el token de acceso ya vigente.
export async function getJwtPayload(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  return verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value)
}

// Throws if the current user lacks the required permission
export async function checkPermission(module: string, action: keyof ModulePermissions) {
  const payload = await getJwtPayload()
  if (!payload) throw new Error('Not authenticated')
  if (!payload.permissions[module]?.[action]) {
    throw new Error(`Permission denied: ${module}.${action}`)
  }
}
