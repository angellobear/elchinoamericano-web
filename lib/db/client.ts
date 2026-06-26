
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

type AppDb = ReturnType<typeof drizzle<typeof schema>>
type DbHandle = { end: () => Promise<unknown> }

// Singleton — evita múltiples conexiones en Next.js dev (hot reload)
const g = globalThis as unknown as { _db?: AppDb; _dbHandle?: DbHandle }

export async function getDb(): Promise<AppDb> {
  if (g._db) return g._db

  const pool = mysql.createPool(process.env.DATABASE_URL!)

  g._db = drizzle(pool, { schema, mode: 'default' }) as unknown as AppDb
  g._dbHandle = pool

  return g._db as AppDb
}

export async function closeDb() {
  const handle = g._dbHandle

  g._db = undefined
  g._dbHandle = undefined

  if (handle) {
    await handle.end()
  }
}
