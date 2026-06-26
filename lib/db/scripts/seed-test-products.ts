#!/usr/bin/env node
/**
 * Inserts 3 test products. Idempotent: skips products whose slug already exists.
 * Run: npx tsx lib/db/scripts/seed-test-products.ts
 */
import { loadDatabaseUrl } from '../config-env'
loadDatabaseUrl('local')

import { closeDb, getDb } from '../client'
import { products, categories, partBrands } from '../schema'
import { eq, sql } from 'drizzle-orm'

async function run() {
  const db = await getDb()
  console.log('\n🌱 Seeding test products...\n')

  const [categoryRows, brandRows] = await Promise.all([
    db.select({ id: categories.id, key: categories.key }).from(categories),
    db.select({ id: partBrands.id, name: partBrands.name }).from(partBrands),
  ])

  const cat = (key: string) => categoryRows.find(c => c.key === key)?.id ?? null
  const brand = (name: string) => brandRows.find(b => b.name === name)?.id ?? null

  const testProducts = [
    {
      slug: 'filtro-de-aceite-motor',
      title: 'Filtro de Aceite Motor',
      shortDescription: 'Compatible con Chery Tiggo 2019–2023, Great Wall Haval 2018–2022',
      description: 'Filtro de aceite de alta filtración para motores de vehículos chinos. Elimina impurezas y protege el motor bajo condiciones exigentes. Duración recomendada: cada 5,000 km o según manual.',
      price: '18.50',
      stock: 45,
      categoryId: cat('filtros'),
      partBrandId: brand('Bosch'),
      type: 'oem',
      isFeatured: true,
    },
    {
      slug: 'pastillas-de-freno-delanteras',
      title: 'Pastillas de Freno Delanteras',
      shortDescription: 'Para Chevrolet Sail 2011–2020 y Aveo 2005–2018',
      description: 'Pastillas de freno de bajo polvo con excelente mordida desde frío. Incluye sensor de desgaste. Certificadas ECE R90.',
      price: '32.00',
      discountPct: '10.00',
      discountUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      stock: 20,
      categoryId: cat('frenos'),
      partBrandId: brand('Brembo'),
      type: 'original',
      isFeatured: false,
    },
    {
      slug: 'amortiguador-delantero-derecho',
      title: 'Amortiguador Delantero Derecho',
      shortDescription: 'Compatible con Ford Explorer 2016–2021 y F-150 2015–2020',
      description: 'Amortiguador de gas nitro de doble tubo. Mejora el confort y la estabilidad en carretera. Instalación directa, no requiere modificaciones.',
      price: '89.90',
      stock: 8,
      categoryId: cat('suspension'),
      partBrandId: brand('Monroe'),
      type: 'aftermarket',
      isFeatured: false,
    },
  ]

  for (const p of testProducts) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, p.slug),
      columns: { id: true, code: true },
    })

    if (existing) {
      console.log(`  ⏭ Skipping "${p.title}" — already exists (${existing.code})`)
      continue
    }

    const result = await db.insert(products).values({
      ...p,
      isActive: true,
      isFeatured: p.isFeatured,
    })
    const raw = result as unknown as [{ insertId: number }]
    const insertId = Number(raw[0]?.insertId)
    const code = `CA-${String(insertId).padStart(4, '0')}`
    await db.update(products).set({ code }).where(eq(products.id, insertId))
    console.log(`  ✓ Created "${p.title}" → ${code}`)
  }

  console.log('\n✅ Done\n')
}

run()
  .then(async () => { await closeDb(); process.exit(0) })
  .catch(async (err) => { console.error('❌ Error:', err); await closeDb().catch(() => {}); process.exit(1) })
