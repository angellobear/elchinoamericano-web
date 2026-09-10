import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

// Crea la tabla announcements y registra su módulo + permisos, sin tocar el resto
// del esquema (drizzle-kit push intenta reescribir tablas con FKs preexistentes).
// Idempotente: se puede correr las veces que haga falta.
const { url: databaseUrl } = loadDatabaseUrl('local')

const statements: [label: string, sql: string][] = [
  ['tabla announcements', `
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
      CONSTRAINT \`announcements_id\` PRIMARY KEY(\`id\`),
      KEY \`announcements_window_idx\` (\`is_active\`,\`starts_at\`,\`ends_at\`)
    )`],

  ['módulo announcements', `
    INSERT INTO \`modules\` (\`key\`, \`label\`) VALUES ('announcements', 'Anuncios')
    ON DUPLICATE KEY UPDATE \`label\` = VALUES(\`label\`)`],

  ['permisos superadmin/admin', `
    INSERT INTO \`role_permissions\` (\`role_id\`, \`module_id\`, \`can_view\`, \`can_create\`, \`can_edit\`, \`can_delete\`)
    SELECT r.\`id\`, m.\`id\`, 1, 1, 1, CASE WHEN r.\`name\` = 'superadmin' THEN 1 ELSE 0 END
    FROM \`roles\` r
    CROSS JOIN \`modules\` m
    WHERE m.\`key\` = 'announcements'
      AND r.\`name\` IN ('superadmin', 'admin')
    ON DUPLICATE KEY UPDATE
      \`can_view\`   = VALUES(\`can_view\`),
      \`can_create\` = VALUES(\`can_create\`),
      \`can_edit\`   = VALUES(\`can_edit\`),
      \`can_delete\` = VALUES(\`can_delete\`)`],
]

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    for (const [label, sql] of statements) {
      await connection.query(sql)
      console.log(`OK: ${label}`)
    }

    const [rows] = await connection.query(
      `SELECT r.name AS rol, p.can_view, p.can_create, p.can_edit, p.can_delete
       FROM role_permissions p
       JOIN roles r ON r.id = p.role_id
       JOIN modules m ON m.id = p.module_id
       WHERE m.\`key\` = 'announcements'`,
    )
    console.table(rows)
    console.log('\nRecordatorio: los permisos van dentro del JWT, cierra sesión y vuelve a entrar.')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar el módulo announcements:', error)
  process.exit(1)
})
