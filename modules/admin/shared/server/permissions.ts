import type { JWTPayload, ModulePermissions } from '@/types'

export type PermissionAction = keyof ModulePermissions

export function hasModulePermission(
  payload: JWTPayload | null,
  moduleKeys: readonly string[],
  action: PermissionAction
): boolean {
  if (!payload) return false

  return moduleKeys.some((moduleKey) => Boolean(payload.permissions[moduleKey]?.[action]))
}
