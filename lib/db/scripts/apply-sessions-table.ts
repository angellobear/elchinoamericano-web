import mysql from 'mysql2/promise'
import { loadPatchDatabaseUrl } from '../config-env'

// Crea la tabla de sesiones del admin, sin tocar el resto del esquema.
// Idempotente: se puede correr las veces que haga falta.
// OJO al desplegar: debe existir ANTES de publicar el código que la usa, o nadie puede iniciar sesión.
const databaseUrl = loadPatchDatabaseUrl()

const statements: [label: string, sql: string][] = [
  ['tabla sessions', `
    CREATE TABLE IF NOT EXISTS \`sessions\` (
      \`id\` char(36) NOT NULL,
      \`user_id\` char(36) NOT NULL,
      \`token_hash\` char(64) NOT NULL,
      \`prev_token_hash\` char(64),
      \`rotated_at\` timestamp NULL,
      \`user_agent\` varchar(255),
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`last_used_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`expires_at\` timestamp NOT NULL,
      \`revoked_at\` timestamp NULL,
      CONSTRAINT \`sessions_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`sessions_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
      KEY \`sessions_user_idx\` (\`user_id\`)
    )`],
]

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    for (const [label, sql] of statements) {
      await connection.query(sql)
      console.log(`OK: ${label}`)
    }

    const [rows] = await connection.query('SELECT COUNT(*) AS sesiones FROM sessions')
    console.table(rows)
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo crear la tabla sessions:', error)
  process.exit(1)
})
