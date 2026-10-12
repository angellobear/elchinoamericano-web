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
import { LEAD_TOKEN_TTL_MS, isSameOriginRequest, signLeadToken, verifyLeadToken } from '@/modules/inbox/guard'

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
assert.ok(okPart.success && okPart.data.type === 'part_request')
assert.equal(okPart.data.name, 'Ana')
assert.equal(okPart.data.phone, '0991234567')

// Registro silencioso: el teléfono es opcional y uno raro se guarda tal cual (no se rechaza).
const noPhone = inboxSubmissionSchema.safeParse({ type: 'part_request', name: 'Ana', payload: { repuesto: 'x', marcaVehiculo: 'Chery' } })
assert.ok(noPhone.success && noPhone.data.type === 'part_request' && noPhone.data.phone === '', 'sin teléfono es válido')
const oddPhone = inboxSubmissionSchema.safeParse({ type: 'part_request', name: 'Ana', phone: '12', payload: { repuesto: 'x', marcaVehiculo: 'Chery' } })
assert.ok(oddPhone.success && oddPhone.data.type === 'part_request' && oddPhone.data.phone === '12', 'teléfono raro se conserva')
assert.equal(
  inboxSubmissionSchema.safeParse({ type: 'part_request', name: 'Ana', phone: '0991234567', payload: { repuesto: 'Filtro', marcaVehiculo: '' } }).success,
  false,
  'marca obligatoria',
)

// Validación: carrito (nombre obligatorio, sin teléfono)
const okCart = inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', items: [{ id: 1, qty: 2 }] })
assert.ok(okCart.success)
assert.equal(inboxSubmissionSchema.safeParse({ type: 'cart', name: '  ', items: [{ id: 1, qty: 2 }] }).success, false, 'carrito exige nombre')
assert.equal(inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', items: [] }).success, false, 'carrito vacío')
assert.equal(inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', items: [{ id: 1, qty: 100 }] }).success, false, 'qty máx 99')
assert.equal(
  inboxSubmissionSchema.safeParse({ type: 'cart', name: 'Ana', items: Array.from({ length: 51 }, (_, i) => ({ id: i + 1, qty: 1 })) }).success,
  false,
  'máx 50 ítems',
)

// Validación: consulta por WhatsApp (anónima)
const okWa = inboxSubmissionSchema.safeParse({ type: 'whatsapp', payload: { source: 'catalogo', item: 'CA-0046', page: '/catalogo' } })
assert.ok(okWa.success)
assert.equal(inboxSubmissionSchema.safeParse({ type: 'whatsapp', payload: { source: '', page: '/' } }).success, false, 'source obligatorio')
assert.equal(inboxSubmissionSchema.safeParse({ type: 'whatsapp', payload: { source: 'x'.repeat(41), page: '/' } }).success, false, 'source máx 40')
assert.equal(summarizeInbox('whatsapp', { source: 'catalogo', item: 'CA-0046', page: '/catalogo' }), 'Botón catalogo · CA-0046')
assert.equal(summarizeInbox('whatsapp', { source: 'general', item: '', page: '/' }), 'Botón general')

// Token de la API interna
const SECRET = 'test-secret'
const t0 = 1_700_000_000_000
const token = signLeadToken(SECRET, t0)
assert.ok(verifyLeadToken(token, SECRET, t0 + 1000), 'token recién emitido es válido')
assert.equal(verifyLeadToken(token, SECRET, t0 + LEAD_TOKEN_TTL_MS + 1), false, 'token vencido')
assert.equal(verifyLeadToken(token, 'otro-secreto', t0 + 1000), false, 'firma con otra llave')
assert.equal(verifyLeadToken(token.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')), SECRET, t0 + 1000), false, 'firma alterada')
const [, sig] = token.split('.')
assert.equal(verifyLeadToken(`${t0 + 10 * LEAD_TOKEN_TTL_MS}.${sig}`, SECRET, t0), false, 'vencimiento inventado')
assert.equal(verifyLeadToken(undefined, SECRET, t0), false)
assert.equal(verifyLeadToken('basura', SECRET, t0), false)

// Origen
assert.ok(isSameOriginRequest({ secFetchSite: 'same-origin', origin: null, host: 'x.com' }))
assert.equal(isSameOriginRequest({ secFetchSite: 'cross-site', origin: 'https://x.com', host: 'x.com' }), false, 'Sec-Fetch-Site manda')
assert.equal(isSameOriginRequest({ secFetchSite: 'none', origin: null, host: 'x.com' }), false, 'navegación directa / curl')
assert.ok(isSameOriginRequest({ secFetchSite: null, origin: 'https://www.elchinoamericano.com', host: 'www.elchinoamericano.com' }))
assert.equal(isSameOriginRequest({ secFetchSite: null, origin: 'https://evil.com', host: 'www.elchinoamericano.com' }), false)
assert.equal(isSameOriginRequest({ secFetchSite: null, origin: null, host: 'x.com' }), false, 'sin encabezados')

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
assert.equal(customerWhatsAppUrl('022345678', 'Hola'), 'https://wa.me/59322345678?text=Hola', 'fijo de Ecuador')
assert.equal(customerWhatsAppUrl('+593991234567', 'Hola Ana'), 'https://wa.me/593991234567?text=Hola%20Ana')

// Params de URL repetidos: primer valor, solo claves conocidas, sin claves undefined
assert.deepEqual(normalizeInboxParams({ search: ['a', 'b'], page: '2', foo: 'x', type: undefined }), { search: 'a', page: '2' })

console.log('✓ bandeja OK')
