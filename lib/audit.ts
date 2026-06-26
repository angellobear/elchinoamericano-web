import { sql } from 'drizzle-orm'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getDb } from '@/lib/db/client'
import { logger } from '@/lib/logger'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'
type DbClient = Awaited<ReturnType<typeof getDb>>
type AuditTx = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown> ? T : never

const REDACTED = '[REDACTED]'
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'apiSecret',
  'api_secret',
])

function sanitizeAuditValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'bigint') return value.toString()

  if (Array.isArray(value)) {
    return value.map(sanitizeAuditValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEYS.has(key) ? REDACTED : sanitizeAuditValue(nestedValue),
      ]),
    )
  }

  return value
}

function serializeAuditPayload(value?: Record<string, unknown>) {
  if (!value) return undefined
  return JSON.stringify(sanitizeAuditValue(value))
}

async function resolveAuditUserId(explicitUserId?: string | null) {
  if (explicitUserId !== undefined) {
    return explicitUserId
  }

  try {
    return (await getJwtPayload())?.userId ?? null
  } catch {
    return null
  }
}

export async function withAudit<T>(
  work: (tx: AuditTx) => Promise<T>,
) {
  const db = await getDb()
  return db.transaction(async (tx) => work(tx))
}

export async function logActivity(
  userId: string | null,
  action: AuditAction,
  tableName: string,
  recordId?: string | number | null,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
) {
  const db = await getDb()

  await db.execute(sql`
    INSERT INTO audit_log (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    )
    VALUES (
      ${userId ?? null},
      ${action},
      ${tableName},
      ${recordId == null ? null : String(recordId)},
      ${serializeAuditPayload(oldValues) ?? null},
      ${serializeAuditPayload(newValues) ?? null}
    )
  `)
}

export async function logActivitySafe(
  action: AuditAction,
  tableName: string,
  recordId?: string | number | null,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  options?: { userId?: string | null },
) {
  try {
    const userId = await resolveAuditUserId(options?.userId)
    await logActivity(userId, action, tableName, recordId, oldValues, newValues)
  } catch (error) {
    logger.warn(
      { error, action, tableName, recordId },
      'Audit log write failed; continuing without blocking main flow',
    )
  }
}
