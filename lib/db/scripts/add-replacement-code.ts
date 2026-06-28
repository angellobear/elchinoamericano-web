import mysql from 'mysql2/promise'
import { loadDatabaseUrl } from '../config-env'

const { url: databaseUrl } = loadDatabaseUrl('local')

async function main() {
  const connection = await mysql.createConnection(databaseUrl)

  const [columns] = await connection.query(
    `SHOW COLUMNS FROM \`products\` LIKE 'replacement_code'`,
  )

  if (Array.isArray(columns) && columns.length > 0) {
    console.log('SKIP: products.replacement_code ya existe')
  } else {
    await connection.execute(
      `ALTER TABLE \`products\` ADD COLUMN \`replacement_code\` VARCHAR(100) NULL AFTER \`sku\``,
    )
    console.log('OK: products.replacement_code agregado')
  }

  await connection.end()
}

main().catch((err) => { console.error(err); process.exit(1) })
