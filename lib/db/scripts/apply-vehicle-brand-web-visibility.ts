import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

const { url: databaseUrl } = loadDatabaseUrl('local')

const statements = [
  'ALTER TABLE vehicle_brands ADD COLUMN IF NOT EXISTS is_visible_on_web BOOLEAN DEFAULT FALSE',
  `UPDATE vehicle_brands
   SET is_visible_on_web = TRUE
   WHERE LOWER(name) IN (
     'chery',
     'great wall',
     'swm',
     'dfsk',
     'jetour',
     'shineray',
     'jac',
     'ford',
     'chevrolet'
   )`,
  'UPDATE vehicle_brands SET is_visible_on_web = FALSE WHERE is_visible_on_web IS NULL',
] as const

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  try {
    for (const statement of statements) {
      await connection.execute(statement)
      console.log(`OK: ${statement.split('\n')[0]}`)
    }

    const [columns] = await connection.query(
      "SHOW COLUMNS FROM vehicle_brands LIKE 'is_visible_on_web'",
    )
    console.log('Columna verificada:', columns)
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar la visibilidad web de marcas:', error)
  process.exit(1)
})
