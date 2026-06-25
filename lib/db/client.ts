
// El tipo de `db` se basa en el schema PG (fuente de verdad para prod).
// En local con MySQL, se castea — la estructura de columnas es idéntica.
import type { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js'
import type * as pgSchema from './schema'

type AppDb = ReturnType<typeof pgDrizzle<typeof pgSchema>>
type DbHandle = { end: () => Promise<unknown> }

// Singleton — evita múltiples conexiones en Next.js dev (hot reload)
const g = globalThis as unknown as { _db?: AppDb; _dbHandle?: DbHandle }

export async function getDb(): Promise<AppDb> {
  if (g._db) return g._db

  if (process.env.APP_ENV === 'local') {
    const { drizzle }  = await import('drizzle-orm/mysql2')
    const mysql        = await import('mysql2/promise')
    const schema       = await import('./schema.mysql')
    const pool         = mysql.createPool(process.env.DATABASE_URL!)
    g._db = drizzle(pool, { schema, mode: 'default' }) as unknown as AppDb
    g._dbHandle = pool
  } else {
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres    = await import('postgres')
    const schema      = await import('./schema')
    const client      = postgres.default(process.env.DATABASE_URL!)
    g._db = drizzle(client, { schema })
    g._dbHandle = client
  }

  return g._db
}

export async function closeDb() {
  const handle = g._dbHandle

  g._db = undefined
  g._dbHandle = undefined

  if (handle) {
    await handle.end()
  }
}
