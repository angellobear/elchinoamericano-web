// Config PostgreSQL — producción (Supabase)
import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import type { Config } from 'drizzle-kit'

export default {
  schema:  './lib/db/schema.ts',
  out:     './supabase/migrations/drizzle-pg',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
