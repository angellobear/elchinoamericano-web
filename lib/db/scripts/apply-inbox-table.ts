import mysql from 'mysql2/promise'
import { loadPatchDatabaseUrl } from '../config-env'

// Crea la tabla inbox_messages y registra su módulo + permisos, sin tocar el resto
// del esquema (drizzle-kit push intenta reescribir tablas con FKs preexistentes).
// Idempotente: se puede correr las veces que haga falta.
const databaseUrl = loadPatchDatabaseUrl()

const statements: [label: string, sql: string][] = [
  ['tabla inbox_messages', `
    CREATE TABLE IF NOT EXISTS \`inbox_messages\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`type\` enum('part_request','cart') NOT NULL,
      \`name\` varchar(120) NOT NULL,
      \`phone\` varchar(30) NOT NULL,
      \`payload\` json NOT NULL,
      \`ip\` varchar(45),
      \`read_at\` timestamp NULL,
      \`hidden_at\` timestamp NULL,
      \`deleted_at\` timestamp NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT \`inbox_messages_id\` PRIMARY KEY(\`id\`),
      KEY \`inbox_created_idx\` (\`created_at\`),
      KEY \`inbox_unread_idx\` (\`read_at\`,\`hidden_at\`),
      KEY \`inbox_ip_idx\` (\`ip\`,\`created_at\`)
    )`],

  ['módulo inbox', `
    INSERT INTO \`modules\` (\`key\`, \`label\`) VALUES ('inbox', 'Bandeja')
    ON DUPLICATE KEY UPDATE \`label\` = VALUES(\`label\`)`],

  ['permisos superadmin/admin', `
    INSERT INTO \`role_permissions\` (\`role_id\`, \`module_id\`, \`can_view\`, \`can_create\`, \`can_edit\`, \`can_delete\`)
    SELECT r.\`id\`, m.\`id\`, 1, 0, 1, 1
    FROM \`roles\` r
    CROSS JOIN \`modules\` m
    WHERE m.\`key\` = 'inbox'
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
       WHERE m.\`key\` = 'inbox'`,
    )
    console.table(rows)
    console.log('\nRecordatorio: los permisos van dentro del JWT, cierra sesión y vuelve a entrar.')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar el módulo inbox:', error)
  process.exit(1)
})
