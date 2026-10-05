import mysql from 'mysql2/promise'
import { loadPatchDatabaseUrl } from '../config-env'

// Crea las tablas de pedidos y registra su módulo + permisos, sin tocar el resto
// del esquema (drizzle-kit push intenta reescribir tablas con FKs preexistentes).
// Idempotente: se puede correr las veces que haga falta.
const databaseUrl = loadPatchDatabaseUrl()

const statements: [label: string, sql: string][] = [
  ['tabla orders', `
    CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`public_token\` char(43) NOT NULL,
      \`customer_name\` varchar(150),
      \`customer_id_number\` varchar(20),
      \`customer_phone\` varchar(30),
      \`discount\` decimal(10,2) NOT NULL DEFAULT '0.00',
      \`invoice_number\` varchar(50),
      \`notes\` text,
      \`estimated_date\` date,
      \`status\` varchar(20) NOT NULL DEFAULT 'pending',
      \`delivered_at\` date,
      \`received_by_name\` varchar(150),
      \`received_by_id_number\` varchar(20),
      \`delivery_photos\` json,
      \`created_by\` char(36),
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT \`orders_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`orders_public_token_unique\` UNIQUE(\`public_token\`),
      KEY \`orders_status_idx\` (\`status\`)
    )`],

  ['tabla order_items', `
    CREATE TABLE IF NOT EXISTS \`order_items\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`order_id\` int NOT NULL,
      \`product_id\` int,
      \`description\` varchar(255) NOT NULL,
      \`quantity\` int NOT NULL DEFAULT 1,
      \`unit_price\` decimal(10,2) NOT NULL,
      CONSTRAINT \`order_items_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`order_items_order_id_fk\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`),
      CONSTRAINT \`order_items_product_id_fk\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`)
    )`],

  ['tabla order_payments', `
    CREATE TABLE IF NOT EXISTS \`order_payments\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`order_id\` int NOT NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`method\` varchar(20) NOT NULL,
      \`reference\` varchar(100),
      \`paid_at\` date NOT NULL,
      \`user_id\` char(36),
      \`voided_at\` timestamp NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT \`order_payments_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`order_payments_order_id_fk\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`)
    )`],

  ['módulo orders', `
    INSERT INTO \`modules\` (\`key\`, \`label\`) VALUES ('orders', 'Pedidos')
    ON DUPLICATE KEY UPDATE \`label\` = VALUES(\`label\`)`],

  ['permisos superadmin/admin', `
    INSERT INTO \`role_permissions\` (\`role_id\`, \`module_id\`, \`can_view\`, \`can_create\`, \`can_edit\`, \`can_delete\`)
    SELECT r.\`id\`, m.\`id\`, 1, 1, 1, CASE WHEN r.\`name\` = 'superadmin' THEN 1 ELSE 0 END
    FROM \`roles\` r
    CROSS JOIN \`modules\` m
    WHERE m.\`key\` = 'orders'
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

    // MySQL no tiene ADD COLUMN IF NOT EXISTS: se agrega solo si falta (aditivo, no toca datos).
    const [deletedAtColumn] = await connection.query(
      `SELECT 1 FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'deleted_at'`,
    )
    if ((deletedAtColumn as unknown[]).length === 0) {
      await connection.query('ALTER TABLE `orders` ADD COLUMN `deleted_at` timestamp NULL AFTER `delivery_photos`')
    }
    console.log('OK: columna orders.deleted_at')

    const [rows] = await connection.query(
      `SELECT r.name AS rol, p.can_view, p.can_create, p.can_edit, p.can_delete
       FROM role_permissions p
       JOIN roles r ON r.id = p.role_id
       JOIN modules m ON m.id = p.module_id
       WHERE m.\`key\` = 'orders'`,
    )
    console.table(rows)
    console.log('\nRecordatorio: los permisos van dentro del JWT, cierra sesión y vuelve a entrar.')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar el módulo orders:', error)
  process.exit(1)
})
