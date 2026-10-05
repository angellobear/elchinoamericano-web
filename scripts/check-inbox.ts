#!/usr/bin/env npx tsx
// Verifica la lógica pura de la bandeja: teléfono, validación por tipo, rango de fechas
// en zona Ecuador, snapshot del carrito con precios del servidor y link de WhatsApp.
import assert from 'node:assert/strict'
import {
  addDays,
  buildCartSnapshot,
  customerWhatsAppUrl,
  ecuadorDayStart,
  inboxSubmissionSchema,
  normalizePhone,
  resolveInboxRange,
  summarizeInbox,
} from '@/modules/inbox/schema'
import { normalizeInboxParams } from '@/modules/admin/inbox/types'

// Teléfono
assert.equal(normalizePhone(' +593 99-123 (4567) '), '+593991234567')
assert.equal(normalizePhone('099.123.4567'), '0991234567')

// Validación: repuesto
const okPart = inboxSubmissionSchema.safeParse({
  type: 'part_request',
  name: '  Ana ',
  phone: '099 123 4567',
  payload: { repuesto: 'Filtro de aceite', marcaVehiculo: 'Chery' },
})
assert.ok(okPart.success)
assert.equal(okPart.data.name, 'Ana')
assert.equal(okPart.data.phone, '0991234567')

assert.equal(
  inboxSubmissionSchema.safeParse({ type: 'part_request', name: 'Ana', phone: '12', payload: { repuesto: 'x1', marcaVehiculo: 'Chery' } }).success,
  false,
  'teléfono corto se rechaza',
)
assert.equal(
  inboxSubmissionSchema.safeParse({ type: 'part_request', name: 'Ana', phone: '0991234567', payload: { repuesto: 'Filtro', marcaVehiculo: '' } }).success,
  false,
  'marca obligatoria',
)

// Validación: carrito
assert.ok(inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', phone: '0991234567', items: [{ id: 1, qty: 2 }] }).success)
assert.equal(inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', phone: '0991234567', items: [] }).success, false, 'carrito vacío')
assert.equal(inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', phone: '0991234567', items: [{ id: 1, qty: 100 }] }).success, false, 'qty máx 99')
assert.equal(
  inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', phone: '0991234567', items: Array.from({ length: 51 }, (_, i) => ({ id: i + 1, qty: 1 })) }).success,
  false,
  'máx 50 ítems',
)

// Snapshot del carrito: precio del servidor, descarta inexistentes, redondea total
const snap = buildCartSnapshot(
  [{ id: 1, qty: 2 }, { id: 99, qty: 1 }, { id: 2, qty: 3 }],
  [
    { id: 1, code: 'A1', title: 'Filtro', slug: 'filtro', unitPrice: 8.71 },
    { id: 2, code: null, title: 'Bujía', slug: 'bujia', unitPrice: 0.1 },
  ],
)
assert.equal(snap.items.length, 2, 'el id 99 no existe y se descarta')
assert.deepEqual(snap.items[1], { id: 2, code: '', title: 'Bujía', slug: 'bujia', qty: 3, unitPrice: 0.1 })
assert.equal(snap.total, 17.72)

// Carrito con IDs duplicados: fusionar cantidad, respetar máx 99
const snapDuplicate = buildCartSnapshot(
  [{ id: 1, qty: 90 }, { id: 1, qty: 90 }],
  [{ id: 1, code: 'X1', title: 'Producto', slug: 'producto', unitPrice: 1 }],
)
assert.equal(snapDuplicate.items.length, 1, 'IDs duplicados se fusionan en uno')
assert.equal(snapDuplicate.items[0].qty, 99, 'cantidad fusionada se clampea a 99')
assert.equal(snapDuplicate.total, 99)

// Rango de fechas
assert.deepEqual(resolveInboxRange({}, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, '30 días con hoy incluido')
assert.deepEqual(resolveInboxRange({ from: '2026-10-01', to: '2026-10-03' }, '2026-10-05'), { from: '2026-10-01', to: '2026-10-03' })
assert.deepEqual(resolveInboxRange({ from: '2026-10-03', to: '2026-10-01' }, '2026-10-05'), { from: '2026-10-01', to: '2026-10-03' }, 'invertido se corrige')
assert.deepEqual(resolveInboxRange({ from: 'basura', to: '' }, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, 'inválido usa default')
assert.equal(addDays('2026-03-01', -1), '2026-02-28')
assert.equal(ecuadorDayStart('2026-10-05').toISOString(), '2026-10-05T05:00:00.000Z')
assert.deepEqual(resolveInboxRange({ to: '2026-99-99' }, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, 'fecha imposible (mes) usa default')
assert.deepEqual(resolveInboxRange({ from: '2026-02-31', to: '2026-10-05' }, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, 'fecha imposible (día) usa default')

// Resumen
assert.equal(
  summarizeInbox('part_request', { repuesto: 'Filtro', marcaVehiculo: 'Chery', modelo: 'Tiggo 5', anio: '2020', cilindraje: '', nota: '', searchQuery: '' }),
  'Filtro · Chery Tiggo 5 2020',
)
assert.equal(summarizeInbox('cart', snap), '5 productos · $17.72')

// WhatsApp al cliente: 09xxxxxxxx de Ecuador → 5939xxxxxxxx
assert.equal(customerWhatsAppUrl('0991234567', 'Hola'), 'https://wa.me/593991234567?text=Hola')
assert.equal(customerWhatsAppUrl('991234567', 'Hola'), 'https://wa.me/593991234567?text=Hola')
assert.equal(customerWhatsAppUrl('+593991234567', 'Hola Ana'), 'https://wa.me/593991234567?text=Hola%20Ana')

// Params de URL repetidos: primer valor, solo claves conocidas, sin claves undefined
assert.deepEqual(normalizeInboxParams({ search: ['a', 'b'], page: '2', foo: 'x', type: undefined }), { search: 'a', page: '2' })

console.log('✓ bandeja OK')
