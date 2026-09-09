import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

// Crea la tabla announcements sin tocar el resto del esquema.
// (drizzle-kit push intenta reescribir tablas con FKs preexistentes.)
const { url: databaseUrl } = loadDatabaseUrl('local')

const createTable = `
CREATE TABLE IF NOT EXISTS \`announcements\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`title\` varchar(150),
  \`description\` text,
  \`image_url\` varchar(500) NOT NULL,
  \`image_public_id\` varchar(200),
  \`link_url\` varchar(500),
  \`starts_at\` date NOT NULL,
  \`ends_at\` date NOT NULL,
  \`is_active\` boolean DEFAULT true,
  \`deleted_at\` timestamp NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`announcements_id\` PRIMARY KEY(\`id\`)
)`

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    await connection.execute(createTable)
    console.log('OK: tabla announcements lista')

    const [indexes] = await connection.query(
      "SHOW INDEX FROM `announcements` WHERE Key_name = 'announcements_window_idx'",
    )

    if (Array.isArray(indexes) && indexes.length > 0) {
      console.log('SKIP: announcements_window_idx ya existe')
      return
    }

    await connection.execute(
      'CREATE INDEX `announcements_window_idx` ON `announcements` (`is_active`, `starts_at`, `ends_at`)',
    )
    console.log('OK: announcements_window_idx creado')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo crear la tabla announcements:', error)
  process.exit(1)
})
