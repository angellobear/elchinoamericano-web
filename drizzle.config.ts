import type { Config } from 'drizzle-kit'
import { loadOptionalDatabaseUrl } from './lib/db/config-env'

const { envFile, url } = loadOptionalDatabaseUrl('prod')
const isGenerateCommand = process.argv.includes('generate')

if (!url && !isGenerateCommand) {
  throw new Error(
    `DATABASE_URL no está definido en ${envFile}. Los comandos PostgreSQL usan solo ese archivo.`,
  )
}

export default {
  schema:  './lib/db/schema.ts',
  out:     './supabase/migrations/drizzle-pg',
  dialect: 'postgresql',
  ...(url ? { dbCredentials: { url } } : {}),
} satisfies Config
