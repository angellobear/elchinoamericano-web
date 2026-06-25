import { and, eq, isNull } from 'drizzle-orm'

export interface SoftDeleteQueryOptions {
  withTrashed?: boolean
}

export interface ActiveQueryOptions extends SoftDeleteQueryOptions {
  includeInactive?: boolean
}

export function normalizeSoftDeleteOptions(options?: SoftDeleteQueryOptions) {
  return {
    withTrashed: options?.withTrashed ?? false,
  }
}

export function normalizeActiveQueryOptions(
  optionsOrIncludeInactive?: boolean | ActiveQueryOptions,
) {
  if (typeof optionsOrIncludeInactive === 'boolean') {
    return {
      includeInactive: optionsOrIncludeInactive,
      withTrashed: false,
    }
  }

  return {
    includeInactive: optionsOrIncludeInactive?.includeInactive ?? false,
    withTrashed: optionsOrIncludeInactive?.withTrashed ?? false,
  }
}

export function buildVisibilityWhere<TActiveColumn, TDeletedAtColumn>(
  isActiveColumn: TActiveColumn,
  deletedAtColumn: TDeletedAtColumn,
  options?: boolean | ActiveQueryOptions,
) {
  const { includeInactive, withTrashed } = normalizeActiveQueryOptions(options)

  return and(
    includeInactive ? undefined : eq(isActiveColumn as never, true),
    withTrashed ? undefined : isNull(deletedAtColumn as never),
  )
}

export function buildNotDeletedWhere<TDeletedAtColumn>(
  deletedAtColumn: TDeletedAtColumn,
  options?: SoftDeleteQueryOptions,
) {
  const { withTrashed } = normalizeSoftDeleteOptions(options)
  return withTrashed ? undefined : isNull(deletedAtColumn as never)
}
