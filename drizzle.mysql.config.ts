// Config MySQL — desarrollo local
// drizzle-kit no carga .env.local automáticamente, lo hacemos aquí
import { config } from 'dotenv'
config({ path: '.env.local' })

import type { Config } from 'drizzle-kit'

const url = new URL(process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/elchinoamericano')

export default {
  schema:  './lib/db/schema.mysql.ts',
  out:     './supabase/migrations/drizzle-mysql',
  dialect: 'mysql',
  dbCredentials: {
    host:     url.hostname,
    port:     Number(url.port) || 3306,
    user:     decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
  },
} satisfies Config
