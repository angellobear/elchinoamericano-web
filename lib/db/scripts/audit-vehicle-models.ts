// Auditoría de solo lectura: modelos de vehículo sucios o duplicados que rompen las páginas por modelo.
//   npx tsx lib/db/scripts/audit-vehicle-models.ts [marca] [local|prod]   (default: ford local)
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
import { loadDatabaseUrl } from '../config-env'
import { stripDisplacement, vehicleModelKey } from '../../vehicle-models'

const brandArg = (process.argv[2] ?? 'ford').toLowerCase()
const target = process.argv[3] === 'prod' ? 'prod' : 'local'
const { url } = loadDatabaseUrl(target)

type Row = RowDataPacket & {
  id: number
  name: string
  displacement: string | null
  products: number
  without_years: number
}

async function main() {
  const conn = await mysql.createConnection(url)
  const [rows] = await conn.query<Row[]>(
    `SELECT m.id, m.name, m.displacement,
            COUNT(DISTINCT p.id) AS products,
            COUNT(DISTINCT CASE WHEN pc.year_start IS NULL THEN p.id END) AS without_years
       FROM vehicle_models m
       JOIN vehicle_brands b ON b.id = m.brand_id
       LEFT JOIN product_compatibilities pc ON pc.vehicle_model_id = m.id
       LEFT JOIN products p ON p.id = pc.product_id AND p.deleted_at IS NULL
      WHERE LOWER(b.name) = ? AND m.deleted_at IS NULL
      GROUP BY m.id
      ORDER BY m.name`,
    [brandArg],
  )
  await conn.end()

  if (rows.length === 0) {
    console.log(`No hay modelos para la marca "${brandArg}".`)
    return
  }

  const groups = new Map<string, Row[]>()
  for (const row of rows) {
    const key = vehicleModelKey(row.name)
    groups.set(key, [...(groups.get(key) ?? []), row])
  }

  const issues: string[] = []
  for (const [key, group] of groups) {
    if (group.length > 1) {
      issues.push(
        `DUPLICADO "${key}": ${group.map((r) => `#${r.id} "${r.name}" (${r.products} prod.)`).join(', ')} → unificar en uno`,
      )
    }
  }
  for (const row of rows) {
    const label = `#${row.id} "${row.name}"`
    const displacement = row.name.trim().match(/\d\.\d\s*L?$/i)?.[0]
    if (displacement && stripDisplacement(row.name) !== row.name.trim()) {
      issues.push(`CILINDRADA EN NOMBRE ${label} → nombre sin "${displacement}", pasarla al campo cilindrada`)
    }
    if (!row.displacement) issues.push(`SIN CILINDRADA ${label}`)
    if (Number(row.without_years) > 0) issues.push(`SIN AÑOS ${label}: ${row.without_years} producto(s) sin año en la compatibilidad`)
    if (Number(row.products) === 0) issues.push(`SIN PRODUCTOS ${label} → revisar si se usa`)
  }

  console.log(`Marca: ${brandArg} (${target}) · ${rows.length} modelos · ${groups.size} modelos únicos\n`)
  console.log('Modelo único → productos (variantes)')
  for (const [key, group] of [...groups].sort((a, b) => sum(b[1]) - sum(a[1]))) {
    console.log(`  ${key.padEnd(18)} ${String(sum(group)).padStart(4)}  (${group.map((r) => r.name).join(' | ')})`)
  }
  console.log(`\n${issues.length} problema(s):`)
  for (const issue of issues.sort()) console.log(`  - ${issue}`)
}

function sum(group: Row[]) {
  return group.reduce((total, row) => total + Number(row.products), 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
