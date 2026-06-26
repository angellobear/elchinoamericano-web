import { config } from 'dotenv'

type DbTarget = 'local' | 'prod'

function loadEnvFile(path: string) {
  config({ path, override: true, debug: true })
}

function validateDatabaseUrl(target: DbTarget, envFile: string, url?: string) {
  if (!url) {
    return undefined
  }

  const trimmedUrl = url.trim()

  if (target === 'local' && !trimmedUrl.startsWith('mysql://')) {
    throw new Error(
      `DATABASE_URL en ${envFile} debe usar mysql:// para el ambiente local.`,
    )
  }

  if (
    target === 'prod'
    && !trimmedUrl.startsWith('postgres://')
    && !trimmedUrl.startsWith('postgresql://')
  ) {
    throw new Error(
      `DATABASE_URL en ${envFile} debe usar postgres:// o postgresql:// para producción.`,
    )
  }

  return trimmedUrl
}

export function loadOptionalDatabaseUrl(target: DbTarget) {
  const envFile = target === 'local' ? '.env.local' : '.env'
  loadEnvFile(envFile)

  return {
    envFile,
    url: validateDatabaseUrl(target, envFile, process.env.DATABASE_URL),
  }
}

export function loadDatabaseUrl(target: DbTarget) {
  const { envFile, url } = loadOptionalDatabaseUrl(target)

  if (!url) {
    throw new Error(
      `DATABASE_URL no está definido para ${target} en ${envFile}.`,
    )
  }

  return { envFile, url }
}

export function parseMysqlUrl(url: string) {
  const parsed = new URL(url)

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
  }
}
