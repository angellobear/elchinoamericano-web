import { sql } from 'drizzle-orm'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getDb } from '@/lib/db/client'
import { auditLog } from '@/lib/db/schema'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'
type AuditExecutor = { execute: (query: ReturnType<typeof sql>) => Promise<unknown> }
type DbClient = Awaited<ReturnType<typeof getDb>>
type AuditTx = Parameters<DbClient['transaction']>[0] extends (tx: infer T) => Promise<unknown> ? T : never

async function resolveAuditUserId(explicitUserId?: string | null) {
  if (explicitUserId !== undefined) {
    return explicitUserId
  }

  try {
    return (await getJwtPayload())?.userId ?? null
  } catch {
    // No request context (seeds, scripts, build-time code, etc.)
    return null
  }
}

async function setAuditContext(db: AuditExecutor, userId: string | null, skip: boolean) {
  if (process.env.APP_ENV === 'local') {
    await db.execute(sql`
      SET
        @app_audit_user_id = ${userId ?? null},
        @app_audit_skip = ${skip ? 1 : 0}
    `)
    return
  }

  await db.execute(sql`
    SELECT
      set_config('app.audit_user_id', ${userId ?? ''}, true),
      set_config('app.audit_skip', ${skip ? '1' : '0'}, true)
  `)
}

async function clearAuditContext(db: AuditExecutor) {
  if (process.env.APP_ENV === 'local') {
    await db.execute(sql`
      SET
        @app_audit_user_id = NULL,
        @app_audit_skip = 0
    `)
  }
}

export async function withAudit<T>(
  work: (tx: AuditTx) => Promise<T>,
  options?: { userId?: string | null; skip?: boolean },
) {
  const db = await getDb()
  const userId = await resolveAuditUserId(options?.userId)
  const skip = options?.skip ?? false

  return db.transaction(async (tx) => {
    await setAuditContext(tx, userId, skip)

    try {
      return await work(tx)
    } finally {
      await clearAuditContext(tx)
    }
  })
}

export async function logActivity(
  userId:     string | null,
  action:     AuditAction,
  tableName:  string,
  recordId:   string | number,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
) {
  const db = await getDb()
  await db.insert(auditLog).values({
    userId:    userId ?? undefined,
    action,
    tableName,
    recordId:  String(recordId),
    oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
    newValues: newValues ? JSON.stringify(newValues) : undefined,
  })
}
