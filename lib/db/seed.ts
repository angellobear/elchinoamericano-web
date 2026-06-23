#!/usr/bin/env node
/**
 * Drizzle seed — runs on any dialect (MySQL local or PostgreSQL prod).
 *
 * Usage:
 *   APP_ENV=local  DATABASE_URL=mysql://...       npx tsx lib/db/seed.ts
 *   APP_ENV=prod   DATABASE_URL=postgresql://...  npx tsx lib/db/seed.ts
 *
 * Idempotent: uses onConflictDoNothing (PG) / insertIgnore pattern.
 * Run on a fresh schema after db:push or db:migrate.
 */
import 'dotenv/config'
import { getDb } from './client'
import {
  roles, modules, rolePermissions,
  categories, vehicleBrands, partBrands, suppliers,
} from './schema'

async function seed() {
  const db = await getDb()

  // ─── Roles ───────────────────────────────────────────────────────────────────
  const [superadminRole, adminRole, employeeRole] = await db.insert(roles).values([
    { name: 'superadmin' },
    { name: 'admin' },
    { name: 'employee' },
  ]).returning({ id: roles.id })

  // ─── Modules ─────────────────────────────────────────────────────────────────
  const moduleList = await db.insert(modules).values([
    { key: 'products',       label: 'Productos' },
    { key: 'categories',     label: 'Categorías' },
    { key: 'inventory',      label: 'Inventario' },
    { key: 'vehicle-brands', label: 'Marcas de vehículos' },
    { key: 'part-brands',    label: 'Marcas de repuestos' },
    { key: 'suppliers',      label: 'Proveedores' },
    { key: 'users',          label: 'Usuarios' },
  ]).returning({ id: modules.id, key: modules.key })

  const moduleMap = Object.fromEntries(moduleList.map(m => [m.key, m.id]))

  // ─── Permissions: superadmin (all), admin (no users), employee (view+inventory) ──
  const allModuleKeys = ['products', 'categories', 'inventory', 'vehicle-brands', 'part-brands', 'suppliers']
  await db.insert(rolePermissions).values([
    // superadmin — full access to everything
    ...Object.values(moduleMap).map(moduleId => ({
      roleId: superadminRole.id, moduleId,
      canView: true, canCreate: true, canEdit: true, canDelete: true,
    })),
    // admin — full access except users module
    ...allModuleKeys.map(key => ({
      roleId: adminRole.id, moduleId: moduleMap[key],
      canView: true, canCreate: true, canEdit: true, canDelete: false,
    })),
    // employee — view + inventory adjustment only
    { roleId: employeeRole.id, moduleId: moduleMap['products'], canView: true, canCreate: false, canEdit: false, canDelete: false },
    { roleId: employeeRole.id, moduleId: moduleMap['inventory'], canView: true, canCreate: true, canEdit: true, canDelete: false },
  ])

  // ─── Categories ──────────────────────────────────────────────────────────────
  await db.insert(categories).values([
    { key: 'motor',       name: 'Motor',       sortOrder: 1 },
    { key: 'frenos',      name: 'Frenos',      sortOrder: 2 },
    { key: 'suspension',  name: 'Suspensión',  sortOrder: 3 },
    { key: 'filtros',     name: 'Filtros',     sortOrder: 4 },
    { key: 'carroceria',  name: 'Carrocería',  sortOrder: 5 },
    { key: 'enfriamiento',name: 'Enfriamiento',sortOrder: 6 },
    { key: 'electrico',   name: 'Eléctrico',   sortOrder: 7 },
    { key: 'transmision', name: 'Transmisión', sortOrder: 8 },
  ])

  // ─── Vehicle brands ──────────────────────────────────────────────────────────
  await db.insert(vehicleBrands).values([
    { name: 'Chevrolet', origin: 'american', sortOrder: 1 },
    { name: 'Ford',      origin: 'american', sortOrder: 2 },
    { name: 'Chery',     origin: 'chinese',  sortOrder: 3 },
    { name: 'Great Wall',origin: 'chinese',  sortOrder: 4 },
    { name: 'DFSK',      origin: 'chinese',  sortOrder: 5 },
    { name: 'BYD',       origin: 'chinese',  sortOrder: 6 },
    { name: 'Jetour',    origin: 'chinese',  sortOrder: 7 },
    { name: 'MG',        origin: 'chinese',  sortOrder: 8 },
    { name: 'JAC',       origin: 'chinese',  sortOrder: 9 },
    { name: 'Shineray',  origin: 'chinese',  sortOrder: 10 },
  ])

  // ─── Part brands ─────────────────────────────────────────────────────────────
  await db.insert(partBrands).values([
    { name: 'Bosch',   originCountry: 'Germany' },
    { name: 'NGK',     originCountry: 'Japan' },
    { name: 'Brembo',  originCountry: 'Italy' },
    { name: 'Monroe',  originCountry: 'USA' },
    { name: 'Gates',   originCountry: 'USA' },
    { name: 'Denso',   originCountry: 'Japan' },
    { name: 'Ferodo',  originCountry: 'UK' },
    { name: 'SKF',     originCountry: 'Sweden' },
    { name: 'Mann',    originCountry: 'Germany' },
    { name: 'Sakura',  originCountry: 'Japan' },
    { name: 'ACDelco', originCountry: 'USA' },
    { name: 'Motorcraft', originCountry: 'USA' },
    { name: 'Moog',    originCountry: 'USA' },
    { name: 'Aisin',   originCountry: 'Japan' },
    { name: 'Valeo',   originCountry: 'France' },
  ])

  // ─── Suppliers ───────────────────────────────────────────────────────────────
  await db.insert(suppliers).values([
    { name: 'Distribuidora AutoPartes Ecuador', contactName: 'Carlos Mendoza', phone: '+593998001001' },
    { name: 'Importadora China Parts Quito',    contactName: 'Liu Wei',         phone: '+593998002002' },
    { name: 'MegaRepuestos Guayaquil',          contactName: 'María Torres',    phone: '+593998003003' },
    { name: 'TecniAuto Cuenca',                 contactName: 'Pedro Vásquez',   phone: '+593998004004' },
  ])

  console.log('✅ Seed completado exitosamente')
}

seed().catch(err => { console.error('❌ Seed falló:', err); process.exit(1) })
