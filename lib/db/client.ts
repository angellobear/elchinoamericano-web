
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
import * as schema from './schema'

type AppDb = ReturnType<typeof drizzle<typeof schema>>
type DbHandle = { end: () => Promise<unknown> }
type VersionRow = RowDataPacket & { version: string }

// Singleton — evita múltiples conexiones en Next.js dev (hot reload)
const g = globalThis as unknown as { _db?: AppDb; _dbHandle?: DbHandle; _dbVersionChecked?: boolean }

async function ensureSupportedMysqlVersion(pool: mysql.Pool) {
  if (g._dbVersionChecked) return

  const [rows] = await pool.query<VersionRow[]>('SELECT VERSION() AS version')
  const version = rows[0]?.version ?? ''

  if (!version) {
    throw new Error('No se pudo detectar la version de MySQL del servidor.')
  }

  if (/mariadb/i.test(version)) {
    throw new Error(
      `Servidor no soportado: ${version}. Este proyecto esta estandarizado para MySQL 8.x, no MariaDB.`,
    )
  }

  const major = Number(version.split('.')[0])

  if (!Number.isFinite(major) || major < 8) {
    throw new Error(
      `Servidor no soportado: ${version}. Este proyecto requiere MySQL 8.0 o superior.`,
    )
  }

  g._dbVersionChecked = true
}

export async function getDb(): Promise<AppDb> {
  if (g._db) return g._db

  const pool = mysql.createPool(process.env.DATABASE_URL!)
  await ensureSupportedMysqlVersion(pool)

  g._db = drizzle(pool, { schema, mode: 'default' }) as unknown as AppDb
  g._dbHandle = pool

  return g._db as AppDb
}

export async function closeDb() {
  const handle = g._dbHandle

  g._db = undefined
  g._dbHandle = undefined
  g._dbVersionChecked = undefined

  if (handle) {
    await handle.end()
  }
}
