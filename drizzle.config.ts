import type { Config } from 'drizzle-kit'
import { loadOptionalDatabaseUrl, parseMysqlUrl } from './lib/db/config-env'

const { envFile, url } = loadOptionalDatabaseUrl('local')
const isGenerateCommand = process.argv.includes('generate')

if (!url && !isGenerateCommand) {
  throw new Error(
    `DATABASE_URL no está definido en ${envFile}. Los comandos Drizzle usan MySQL.`,
  )
}

export default {
  schema: './lib/db/schema.ts',
  out: './supabase/migrations/drizzle-mysql',
  dialect: 'mysql',
  ...(url ? { dbCredentials: parseMysqlUrl(url) } : {}),
} satisfies Config
