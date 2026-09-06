import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

const { url: databaseUrl } = loadDatabaseUrl('local')

// La columna guarda un epoch en SEGUNDOS (BIGINT), no un TIMESTAMP: así la
// marca y el claim `iat` del JWT viven en la misma unidad y en el mismo reloj,
// sin conversión de zona horaria entre MySQL y Node.
async function ensureSessionsRevokedAtColumn(connection: mysql.Connection) {
  const [columns] = await connection.query(
    "SHOW COLUMNS FROM `users` LIKE 'sessions_revoked_at'",
  )

  if (Array.isArray(columns) && columns.length > 0) {
    console.log('SKIP: users.sessions_revoked_at ya existe')
    return
  }

  await connection.execute(
    'ALTER TABLE `users` ADD COLUMN `sessions_revoked_at` BIGINT NULL',
  )
  console.log('OK: users.sessions_revoked_at agregado')
}

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    await ensureSessionsRevokedAtColumn(connection)

    const [columns] = await connection.query(
      "SHOW COLUMNS FROM `users` LIKE 'sessions_revoked_at'",
    )
    console.log('Columna verificada:', columns)
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar sessions_revoked_at a users:', error)
  process.exit(1)
})
