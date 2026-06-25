import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

const { url: databaseUrl } = loadDatabaseUrl('local')

const tables = [
  'users',
  'vehicle_brands',
  'vehicle_models',
  'categories',
  'part_brands',
  'suppliers',
  'products',
] as const

async function ensureDeletedAtColumn(
  connection: mysql.Connection,
  table: typeof tables[number],
) {
  const [columns] = await connection.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE 'deleted_at'`,
  )

  if (Array.isArray(columns) && columns.length > 0) {
    console.log(`SKIP: ${table}.deleted_at ya existe`)
    return
  }

  await connection.execute(
    `ALTER TABLE \`${table}\` ADD COLUMN \`deleted_at\` TIMESTAMP NULL`,
  )
  console.log(`OK: ${table}.deleted_at agregado`)
}

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    for (const table of tables) {
      await ensureDeletedAtColumn(connection, table)
    }
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar deleted_at a las tablas requeridas:', error)
  process.exit(1)
})
