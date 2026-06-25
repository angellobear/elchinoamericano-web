#!/usr/bin/env node
/**
 * Drizzle seed — idempotente en MySQL (local) y PostgreSQL (prod).
 *
 * Usage:
 *   npm run db:seed:local   (APP_ENV=local → mysql)
 *   npm run db:seed         (APP_ENV=prod  → postgresql)
 */
import { loadDatabaseUrl } from './config-env'

const target = process.env.APP_ENV === 'local' ? 'local' : 'prod'
loadDatabaseUrl(target)

import { sql, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { closeDb, getDb } from './client'
import {
  roles, modules, rolePermissions, users,
  categories, vehicleBrands, partBrands, suppliers,
} from './schema'

const isMySQL = process.env.APP_ENV === 'local'

// INSERT or update-on-duplicate (idempotent).
// mysqlSet keys must be camelCase (Drizzle schema names); values are the SQL expressions.
// sql.raw('col_name') produces `ON DUPLICATE KEY UPDATE col_name = col_name` (no-op self-ref).
// ponytail: as any — getDb() tipos como PG pero runtime puede ser MySQL
function upsert(q: any, mysqlSet: Record<string, unknown>) {
  return isMySQL
    ? q.onDuplicateKeyUpdate({ set: mysqlSet })
    : q.onConflictDoNothing()
}

const log = (label: string, items: { name: string }[]) =>
  console.log(`  ✓ ${label.padEnd(20)} ${items.map(i => i.name).join(', ')}`)

async function seed() {
  const db = await getDb()
  console.log(`\n🌱 Iniciando seed [${process.env.APP_ENV ?? 'prod'}]\n`)

  // ─── Roles ───────────────────────────────────────────────────────────────────
  const roleValues = [
    { name: 'superadmin' },
    { name: 'admin' },
    { name: 'employee' },
  ]
  await upsert(db.insert(roles).values(roleValues), { name: sql.raw('name') })
  log('roles', roleValues)

  const roleRows = await db.select().from(roles)
  const roleMap = Object.fromEntries(roleRows.map(r => [r.name, r.id]))

  // ─── Modules ─────────────────────────────────────────────────────────────────
  const moduleValues = [
    { key: 'products',       label: 'Productos',           name: 'Productos' },
    { key: 'categories',     label: 'Categorías',          name: 'Categorías' },
    { key: 'inventory',      label: 'Inventario',          name: 'Inventario' },
    { key: 'vehicle-brands', label: 'Marcas de vehículos', name: 'Marcas vehículos' },
    { key: 'part-brands',    label: 'Marcas de repuestos', name: 'Marcas repuestos' },
    { key: 'suppliers',      label: 'Proveedores',         name: 'Proveedores' },
    { key: 'users',          label: 'Usuarios',            name: 'Usuarios' },
  ]
  await upsert(db.insert(modules).values(moduleValues.map(({ name: _n, ...m }) => m)), { label: sql.raw('label') })
  log('módulos', moduleValues)

  const moduleRows = await db.select().from(modules)
    .where(inArray(modules.key, moduleValues.map(m => m.key)))
  const modMap = Object.fromEntries(moduleRows.map(m => [m.key, m.id]))

  // ─── Permissions ─────────────────────────────────────────────────────────────
  const allKeys = ['products', 'categories', 'inventory', 'vehicle-brands', 'part-brands', 'suppliers']
  const permRows = [
    ...Object.values(modMap).map(moduleId => ({
      roleId: roleMap['superadmin'], moduleId,
      canView: true, canCreate: true, canEdit: true, canDelete: true,
    })),
    ...allKeys.map(key => ({
      roleId: roleMap['admin'], moduleId: modMap[key],
      canView: true, canCreate: true, canEdit: true, canDelete: false,
    })),
    { roleId: roleMap['employee'], moduleId: modMap['products'],  canView: true,  canCreate: false, canEdit: false, canDelete: false },
    { roleId: roleMap['employee'], moduleId: modMap['inventory'], canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
  ]
  await upsert(db.insert(rolePermissions).values(permRows), { canView: sql.raw('can_view') })
  console.log(`  ✓ ${'permisos'.padEnd(20)} ${permRows.length} filas (superadmin: 7, admin: 6, employee: 2)`)

  // ─── Categories ──────────────────────────────────────────────────────────────
  const categoryValues = [
    { key: 'motor',        name: 'Motor',        sortOrder: 1 },
    { key: 'frenos',       name: 'Frenos',       sortOrder: 2 },
    { key: 'suspension',   name: 'Suspensión',   sortOrder: 3 },
    { key: 'filtros',      name: 'Filtros',      sortOrder: 4 },
    { key: 'carroceria',   name: 'Carrocería',   sortOrder: 5 },
    { key: 'enfriamiento', name: 'Enfriamiento', sortOrder: 6 },
    { key: 'electrico',    name: 'Eléctrico',    sortOrder: 7 },
    { key: 'transmision',  name: 'Transmisión',  sortOrder: 8 },
  ]
  await upsert(db.insert(categories).values(categoryValues), { name: sql.raw('name') })
  log('categorías', categoryValues)

  // ─── Vehicle brands ──────────────────────────────────────────────────────────
  const brandValues = [
    { name: 'Chevrolet',  origin: 'american', sortOrder: 1 },
    { name: 'Ford',       origin: 'american', sortOrder: 2 },
    { name: 'Chery',      origin: 'chinese',  sortOrder: 3 },
    { name: 'Great Wall', origin: 'chinese',  sortOrder: 4 },
    { name: 'DFSK',       origin: 'chinese',  sortOrder: 5 },
    { name: 'BYD',        origin: 'chinese',  sortOrder: 6 },
    { name: 'Jetour',     origin: 'chinese',  sortOrder: 7 },
    { name: 'MG',         origin: 'chinese',  sortOrder: 8 },
    { name: 'JAC',        origin: 'chinese',  sortOrder: 9 },
    { name: 'Shineray',   origin: 'chinese',  sortOrder: 10 },
  ]
  {
    const existing = new Set((await db.select({ name: vehicleBrands.name }).from(vehicleBrands)).map(r => r.name))
    const toInsert = brandValues.filter(b => !existing.has(b.name))
    if (toInsert.length) await db.insert(vehicleBrands).values(toInsert)
  }
  log('marcas vehículos', brandValues)

  // ─── Part brands ─────────────────────────────────────────────────────────────
  const partBrandValues = [
    { name: 'Bosch',      originCountry: 'Germany' },
    { name: 'NGK',        originCountry: 'Japan' },
    { name: 'Brembo',     originCountry: 'Italy' },
    { name: 'Monroe',     originCountry: 'USA' },
    { name: 'Gates',      originCountry: 'USA' },
    { name: 'Denso',      originCountry: 'Japan' },
    { name: 'Ferodo',     originCountry: 'UK' },
    { name: 'SKF',        originCountry: 'Sweden' },
    { name: 'Mann',       originCountry: 'Germany' },
    { name: 'Sakura',     originCountry: 'Japan' },
    { name: 'ACDelco',    originCountry: 'USA' },
    { name: 'Motorcraft', originCountry: 'USA' },
    { name: 'Moog',       originCountry: 'USA' },
    { name: 'Aisin',      originCountry: 'Japan' },
    { name: 'Valeo',      originCountry: 'France' },
  ]
  {
    const existing = new Set((await db.select({ name: partBrands.name }).from(partBrands)).map(r => r.name))
    const toInsert = partBrandValues.filter(b => !existing.has(b.name))
    if (toInsert.length) await db.insert(partBrands).values(toInsert)
  }
  log('marcas repuestos', partBrandValues)

  // ─── Suppliers ───────────────────────────────────────────────────────────────
  const supplierValues = [
    { name: 'Distribuidora AutoPartes Ecuador', contactName: 'Carlos Mendoza', phone: '+593998001001' },
    { name: 'Importadora China Parts Quito',    contactName: 'Liu Wei',        phone: '+593998002002' },
    { name: 'MegaRepuestos Guayaquil',          contactName: 'María Torres',   phone: '+593998003003' },
    { name: 'TecniAuto Cuenca',                 contactName: 'Pedro Vásquez',  phone: '+593998004004' },
  ]
  {
    const existing = new Set((await db.select({ name: suppliers.name }).from(suppliers)).map(r => r.name))
    const toInsert = supplierValues.filter(s => !existing.has(s.name))
    if (toInsert.length) await db.insert(suppliers).values(toInsert)
  }
  log('proveedores', supplierValues)

  // ─── Dev users ───────────────────────────────────────────────────────────────
  // Cambiar passwords antes de producción
  const devUsers = [
    { email: 'superadmin@elchinoamericano.com', fullName: 'Super Administrador', password: 'SuperAdmin2025!', role: 'superadmin' },
    { email: 'admin@elchinoamericano.com',      fullName: 'Administrador',        password: 'Admin2025!',      role: 'admin' },
    { email: 'vendedor@elchinoamericano.com',   fullName: 'Vendedor Uno',          password: 'Empleado2025!',   role: 'employee' },
  ]
  for (const u of devUsers) {
    const passwordHash = await bcrypt.hash(u.password, 12)
    await upsert(db.insert(users).values({
      id:           randomUUID(),
      email:        u.email,
      fullName:     u.fullName,
      passwordHash,
      roleId:       roleMap[u.role],
      isActive:     true,
    }), { email: sql.raw('email') })
  }
  console.log(`  ✓ ${'usuarios dev'.padEnd(20)} ${devUsers.map(u => u.email).join(', ')}`)
  console.log('    Passwords: SuperAdmin2025! / Admin2025! / Empleado2025!')

  console.log('\n✅ Seed completado exitosamente\n')
}

seed()
  .then(async () => {
    await closeDb()
    process.exit(0)
  })
  .catch(async (err) => {
    console.error('❌ Seed falló:', err)
    await closeDb().catch(() => {})
    process.exit(1)
  })
