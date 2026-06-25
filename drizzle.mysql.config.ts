import type { Config } from 'drizzle-kit'

export default {
  schema:  './lib/db/schema.mysql.ts',
  out:     './supabase/migrations/drizzle-mysql',
  dialect: 'mysql',
  dbCredentials: {
    host:     process.env.DB_HOST     ?? 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME     ?? 'elchinoamericano',
  },
} satisfies Config
