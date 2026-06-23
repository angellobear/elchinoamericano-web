import { getDb } from '@/lib/db/client'
import { auditLog } from '@/lib/db/schema'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

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
