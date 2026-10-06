# Bandeja de leads (Inbox) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Los formularios "repuesto no encontrado" y "pedido de carrito" guardan un lead (nombre + teléfono) en una bandeja del admin con badge de no leídos, filtros, ocultar y borrado lógico.

**Architecture:** Una tabla `inbox_messages` (columnas comunes + `payload` JSON por tipo). Un Server Action público valida (Zod), aplica honeypot + rate limit por IP y recalcula precios del carrito en servidor. El admin lista con filtros por query params, y el layout calcula el contador de no leídos para el sidebar.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript, MySQL 8 + Drizzle 0.45, Zod 4, Tailwind, shadcn/ui, sonner, lucide-react.

**Spec:** `docs/superpowers/specs/2026-10-05-inbox-leads-design.md`

## Global Constraints

- Nunca crear `middleware.ts`; los permisos de ruta van en `proxy.ts` (`routePermissions`).
- Antes de tocar comportamiento de App Router, leer el guía relevante en `node_modules/next/dist/docs/`.
- Server Components por defecto; solo lo interactivo en Client Components.
- Rutas admin son capa de rutas; lógica de dominio en `modules/**`, infraestructura en `lib/**`.
- Tailwind: usar utilidades canónicas antes que valores arbitrarios (`h-3` no `h-[12px]`).
- Paleta: `navy`, `brand`, `wa`. Sin direcciones de color nuevas.
- Rate limit: máximo **5** envíos por IP cada **10** minutos.
- Teléfono normalizado debe cumplir `^\+?\d{7,15}$`.
- Carrito: 1–50 ítems, `qty` 1–99. Precio siempre recalculado en servidor.
- Rango por defecto del listado: **últimos 30 días** (hoy incluido) en zona `America/Guayaquil` (UTC−5 fijo, sin horario de verano).
- Paginación: **50** por página.
- Los demás botones de WhatsApp del sitio **no cambian**.
- Textos de confirmación exactos:
  - Repuesto: "¡Solicitud recibida! Un asesor te contactará pronto."
  - Carrito: "¡Pedido recibido! Un asesor te contactará pronto para confirmar disponibilidad y envío."
- Tests: scripts `assert` con `npx tsx` en `scripts/check-*.ts`, registrados en `package.json` (patrón existente; no hay framework de tests).
- Commits en español, estilo "Bandeja: …".

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `modules/inbox/schema.ts` | Create | Lógica pura: Zod, `normalizePhone`, rangos de fecha, snapshot de carrito, resumen, URL de WhatsApp al cliente |
| `scripts/check-inbox.ts` | Create | Test `assert` de `modules/inbox/schema.ts` |
| `lib/db/schema.ts` | Modify | Tabla `inboxMessages` |
| `lib/db/scripts/apply-inbox-table.ts` | Create | Parche idempotente: tabla + módulo + permisos |
| `lib/db/products.ts` | Modify | Exportar `offerPrice` |
| `lib/db/inbox.ts` | Create | Repositorio Drizzle |
| `proxy.ts` | Modify | `'/admin/inbox'` → `inbox.can_view` |
| `lib/routes.ts` | Modify | `routes.admin.inbox` |
| `modules/inbox/server/actions.ts` | Create | Server Action público `submitInboxMessage` |
| `lib/analytics.ts` | Modify | `trackLead(source)` |
| `components/RequestPartForm.tsx` | Modify | Envía al inbox, confirmación + link WA |
| `components/CartDrawer.tsx` | Modify | Nombre/teléfono, envía al inbox, vacía carrito |
| `modules/admin/inbox/types.ts` | Create | `INBOX_PERMISSION_KEYS` |
| `modules/admin/inbox/server/actions.ts` | Create | Leer/no leer, ocultar/mostrar, eliminar, marcar todo |
| `modules/admin/inbox/components/InboxRowActions.tsx` | Create | Botones por fila (cliente) |
| `modules/admin/inbox/components/MarkAllReadButton.tsx` | Create | Acción masiva (cliente) |
| `app/admin/inbox/page.tsx` | Create | Listado + filtros (form GET) |
| `app/admin/inbox/[id]/page.tsx` | Create | Detalle, marca leído |
| `app/admin/layout.tsx` | Modify | `countUnread()` → props |
| `app/admin/_components/SidebarNav.tsx` | Modify | Ítem "Bandeja" + badge |
| `app/admin/_components/MobileAdminHeader.tsx` | Modify | Punto en el menú + pasa contador |
| `package.json` | Modify | `check:inbox`, `db:patch:inbox` |
| `docs/admin-architecture.md` | Modify | Mención del módulo inbox |

---

### Task 1: Lógica pura del inbox + test

**Files:**
- Create: `modules/inbox/schema.ts`
- Create: `scripts/check-inbox.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `INBOX_TYPES`, `type InboxType = 'part_request' | 'cart'`
  - `RATE_LIMIT_MAX = 5`, `RATE_LIMIT_WINDOW_MIN = 10`, `INBOX_PAGE_SIZE = 50`
  - `normalizePhone(raw: string): string`
  - `inboxSubmissionSchema` (Zod discriminated union) y `type InboxSubmission`
  - `type PartRequestPayload`, `interface CartSnapshotItem`, `interface CartPayload`, `type InboxPayload`
  - `interface PricedProduct { id: number; code: string | null; title: string; slug: string; unitPrice: number }`
  - `buildCartSnapshot(requested: { id: number; qty: number }[], rows: PricedProduct[]): CartPayload`
  - `resolveInboxRange(params: { from?: string; to?: string }, today: string): { from: string; to: string }`
  - `ecuadorDayStart(date: string): Date` (00:00 Ecuador como instante UTC)
  - `addDays(date: string, days: number): string`
  - `summarizeInbox(type: InboxType, payload: InboxPayload): string`
  - `customerWhatsAppUrl(phone: string, text: string): string`

- [ ] **Step 1: Escribir el test que falla**

`scripts/check-inbox.ts`:

```ts
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

// Rango de fechas
assert.deepEqual(resolveInboxRange({}, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, '30 días con hoy incluido')
assert.deepEqual(resolveInboxRange({ from: '2026-10-01', to: '2026-10-03' }, '2026-10-05'), { from: '2026-10-01', to: '2026-10-03' })
assert.deepEqual(resolveInboxRange({ from: '2026-10-03', to: '2026-10-01' }, '2026-10-05'), { from: '2026-10-01', to: '2026-10-03' }, 'invertido se corrige')
assert.deepEqual(resolveInboxRange({ from: 'basura', to: '' }, '2026-10-05'), { from: '2026-09-06', to: '2026-10-05' }, 'inválido usa default')
assert.equal(addDays('2026-03-01', -1), '2026-02-28')
assert.equal(ecuadorDayStart('2026-10-05').toISOString(), '2026-10-05T05:00:00.000Z')

// Resumen
assert.equal(
  summarizeInbox('part_request', { repuesto: 'Filtro', marcaVehiculo: 'Chery', modelo: 'Tiggo 5', anio: '2020', cilindraje: '', nota: '', searchQuery: '' }),
  'Filtro · Chery Tiggo 5 2020',
)
assert.equal(summarizeInbox('cart', snap), '5 productos · $17.72')

// WhatsApp al cliente: 09xxxxxxxx de Ecuador → 5939xxxxxxxx
assert.equal(customerWhatsAppUrl('0991234567', 'Hola'), 'https://wa.me/593991234567?text=Hola')
assert.equal(customerWhatsAppUrl('+593991234567', 'Hola Ana'), 'https://wa.me/593991234567?text=Hola%20Ana')

console.log('✓ bandeja OK')
```

En `package.json`, dentro de `scripts`, después de `"check:sessions"`:

```json
    "check:sessions": "npx tsx scripts/check-sessions.ts",
    "check:inbox": "npx tsx scripts/check-inbox.ts"
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npm run check:inbox`
Expected: FAIL con `Cannot find module '@/modules/inbox/schema'`

- [ ] **Step 3: Implementar `modules/inbox/schema.ts`**

```ts
import { z } from 'zod'

// Lógica pura de la bandeja: sin DB ni Next, para poder probarla con tsx.

export const INBOX_TYPES = ['part_request', 'cart'] as const
export type InboxType = (typeof INBOX_TYPES)[number]

export const INBOX_TYPE_LABEL: Record<InboxType, string> = {
  part_request: 'Solicitud',
  cart: 'Pedido',
}

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MIN = 10
export const INBOX_PAGE_SIZE = 50

export function normalizePhone(raw: string) {
  return raw.trim().replace(/[\s\-().]/g, '')
}

const nameField = z.string().trim().min(2, 'Ingresa tu nombre.').max(120, 'El nombre es muy largo.')
const phoneField = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^\+?\d{7,15}$/, 'Ingresa un teléfono válido (7 a 15 dígitos).'))
const optionalText = (max: number) => z.string().trim().max(max).optional().default('')

export const partRequestPayloadSchema = z.object({
  repuesto: z.string().trim().min(2, 'Indica el repuesto que necesitas.').max(200),
  marcaVehiculo: z.string().trim().min(1, 'Indica la marca del vehículo.').max(60),
  modelo: optionalText(60),
  anio: optionalText(4),
  cilindraje: optionalText(30),
  nota: optionalText(500),
  searchQuery: optionalText(200),
})

export const inboxSubmissionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('part_request'),
    name: nameField,
    phone: phoneField,
    payload: partRequestPayloadSchema,
  }),
  z.object({
    type: z.literal('cart'),
    name: nameField,
    phone: phoneField,
    items: z
      .array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1).max(99) }))
      .min(1, 'Tu pedido está vacío.')
      .max(50, 'Tu pedido tiene demasiados productos.'),
  }),
])

export type InboxSubmissionInput = z.input<typeof inboxSubmissionSchema>
export type InboxSubmission = z.output<typeof inboxSubmissionSchema>
export type PartRequestPayload = z.output<typeof partRequestPayloadSchema>

export interface CartSnapshotItem {
  id: number
  code: string
  title: string
  slug: string
  qty: number
  unitPrice: number
}

export interface CartPayload {
  items: CartSnapshotItem[]
  total: number
}

export type InboxPayload = PartRequestPayload | CartPayload

export interface PricedProduct {
  id: number
  code: string | null
  title: string
  slug: string
  unitPrice: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Arma el snapshot con precios del servidor. Los ids que ya no existen se descartan. */
export function buildCartSnapshot(requested: { id: number; qty: number }[], rows: PricedProduct[]): CartPayload {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const items = requested.flatMap(({ id, qty }) => {
    const product = byId.get(id)
    return product
      ? [{ id, code: product.code ?? '', title: product.title, slug: product.slug, qty, unitPrice: product.unitPrice }]
      : []
  })
  return { items, total: round2(items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)) }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Rango del listado. Default: últimos 30 días con hoy incluido. Invertido se corrige. */
export function resolveInboxRange(params: { from?: string; to?: string }, today: string) {
  const to = params.to && ISO_DATE.test(params.to) ? params.to : today
  const from = params.from && ISO_DATE.test(params.from) ? params.from : addDays(to, -29)
  return from <= to ? { from, to } : { from: to, to: from }
}

// ponytail: Ecuador es UTC−5 fijo (sin horario de verano), no hace falta una lib de zonas.
export function ecuadorDayStart(date: string) {
  return new Date(`${date}T00:00:00-05:00`)
}

export function summarizeInbox(type: InboxType, payload: InboxPayload) {
  if (type === 'cart') {
    const cart = payload as CartPayload
    const units = cart.items.reduce((sum, item) => sum + item.qty, 0)
    return `${units} ${units === 1 ? 'producto' : 'productos'} · $${cart.total.toFixed(2)}`
  }
  const part = payload as PartRequestPayload
  const vehicle = [part.marcaVehiculo, part.modelo, part.anio, part.cilindraje].filter(Boolean).join(' ')
  return vehicle ? `${part.repuesto} · ${vehicle}` : part.repuesto
}

/** wa.me exige el número internacional sin "+". Un 09xxxxxxxx de Ecuador pasa a 5939xxxxxxxx. */
export function customerWhatsAppUrl(phone: string, text: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) digits = `593${digits.slice(1)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `npm run check:inbox`
Expected: `✓ bandeja OK`

- [ ] **Step 5: Commit**

```bash
git add modules/inbox/schema.ts scripts/check-inbox.ts package.json
git commit -m "Bandeja: lógica pura (validación, rango de fechas, snapshot de carrito) con su check"
```

---

### Task 2: Tabla, parche, repositorio y permiso de ruta

**Files:**
- Modify: `lib/db/schema.ts` (agregar tabla después de `announcements`, ~línea 273; agregar `json` y `mysqlEnum` al import de `drizzle-orm/mysql-core` si faltan)
- Create: `lib/db/scripts/apply-inbox-table.ts`
- Modify: `lib/db/products.ts:30` (`function offerPrice` → `export function offerPrice`)
- Create: `lib/db/inbox.ts`
- Modify: `proxy.ts` (`routePermissions`)
- Modify: `lib/routes.ts` (`admin.inbox`)
- Modify: `package.json` (`db:patch:inbox`)

**Interfaces:**
- Consumes: `InboxType`, `InboxPayload`, `PricedProduct`, `INBOX_PAGE_SIZE` (Task 1)
- Produces (`lib/db/inbox.ts`):
  - `interface InboxFilters { type?: InboxType; unreadOnly?: boolean; includeHidden?: boolean; from: Date; toExclusive: Date; search?: string }`
  - `insertInboxMessage(values: { type: InboxType; name: string; phone: string; payload: InboxPayload; ip: string | null }): Promise<void>`
  - `countRecentByIp(ip: string, minutes: number): Promise<number>`
  - `getPricedProducts(ids: number[]): Promise<PricedProduct[]>`
  - `listInbox(filters: InboxFilters, page: number): Promise<{ rows: InboxRow[]; total: number }>`
  - `countUnread(): Promise<number>`
  - `getInboxMessage(id: number): Promise<InboxRow | undefined>`
  - `setInboxRead(id: number, read: boolean): Promise<void>`
  - `setInboxHidden(id: number, hidden: boolean): Promise<void>`
  - `softDeleteInboxMessage(id: number): Promise<void>`
  - `markAllInboxRead(filters: InboxFilters): Promise<void>`
  - `type InboxRow = typeof inboxMessages.$inferSelect`
  - `routes.admin.inbox.index = '/admin/inbox'`, `routes.admin.inbox.detail(id)`

- [ ] **Step 1: Tabla en Drizzle**

En `lib/db/schema.ts`, después de `announcements`:

```ts
// Bandeja de leads: solicitudes de repuesto y pedidos de carrito desde el sitio público.
// Relativo y solo de tipo, igual que DeliveryPhoto: drizzle-kit no resuelve "@/".
export const inboxMessages = mysqlTable('inbox_messages', {
  id: int('id').autoincrement().primaryKey(),
  type: mysqlEnum('type', ['part_request', 'cart']).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  payload: json('payload').$type<InboxPayload>().notNull(),
  ip: varchar('ip', { length: 45 }),
  readAt: timestamp('read_at'),
  hiddenAt: timestamp('hidden_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').default(mysqlCurrentTimestamp),
}, (t) => ({
  createdIdx: index('inbox_created_idx').on(t.createdAt),
  unreadIdx: index('inbox_unread_idx').on(t.readAt, t.hiddenAt),
  ipIdx: index('inbox_ip_idx').on(t.ip, t.createdAt),
}))
```

Arriba, junto al import de `DeliveryPhoto`:

```ts
import type { InboxPayload } from '../../modules/inbox/schema'
```

Revisar el import de `drizzle-orm/mysql-core` al inicio del archivo y agregar `json`, `mysqlEnum`, `index` si no están.

- [ ] **Step 2: Script de parche**

`lib/db/scripts/apply-inbox-table.ts`:

```ts
import mysql from 'mysql2/promise'
import { loadPatchDatabaseUrl } from '../config-env'

// Crea la tabla inbox_messages y registra su módulo + permisos, sin tocar el resto
// del esquema (drizzle-kit push intenta reescribir tablas con FKs preexistentes).
// Idempotente: se puede correr las veces que haga falta.
const databaseUrl = loadPatchDatabaseUrl()

const statements: [label: string, sql: string][] = [
  ['tabla inbox_messages', `
    CREATE TABLE IF NOT EXISTS \`inbox_messages\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`type\` enum('part_request','cart') NOT NULL,
      \`name\` varchar(120) NOT NULL,
      \`phone\` varchar(30) NOT NULL,
      \`payload\` json NOT NULL,
      \`ip\` varchar(45),
      \`read_at\` timestamp NULL,
      \`hidden_at\` timestamp NULL,
      \`deleted_at\` timestamp NULL,
      \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT \`inbox_messages_id\` PRIMARY KEY(\`id\`),
      KEY \`inbox_created_idx\` (\`created_at\`),
      KEY \`inbox_unread_idx\` (\`read_at\`,\`hidden_at\`),
      KEY \`inbox_ip_idx\` (\`ip\`,\`created_at\`)
    )`],

  ['módulo inbox', `
    INSERT INTO \`modules\` (\`key\`, \`label\`) VALUES ('inbox', 'Bandeja')
    ON DUPLICATE KEY UPDATE \`label\` = VALUES(\`label\`)`],

  ['permisos superadmin/admin', `
    INSERT INTO \`role_permissions\` (\`role_id\`, \`module_id\`, \`can_view\`, \`can_create\`, \`can_edit\`, \`can_delete\`)
    SELECT r.\`id\`, m.\`id\`, 1, 0, 1, 1
    FROM \`roles\` r
    CROSS JOIN \`modules\` m
    WHERE m.\`key\` = 'inbox'
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

    const [rows] = await connection.query(
      `SELECT r.name AS rol, p.can_view, p.can_create, p.can_edit, p.can_delete
       FROM role_permissions p
       JOIN roles r ON r.id = p.role_id
       JOIN modules m ON m.id = p.module_id
       WHERE m.\`key\` = 'inbox'`,
    )
    console.table(rows)
    console.log('\nRecordatorio: los permisos van dentro del JWT, cierra sesión y vuelve a entrar.')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar el módulo inbox:', error)
  process.exit(1)
})
```

En `package.json`, después de `"db:patch:sessions"`:

```json
    "db:patch:inbox": "npx tsx lib/db/scripts/apply-inbox-table.ts",
```

- [ ] **Step 3: Exportar `offerPrice`**

`lib/db/products.ts:30`: cambiar `function offerPrice(` por `export function offerPrice(`.

- [ ] **Step 4: Repositorio `lib/db/inbox.ts`**

```ts
import { and, count, desc, eq, gte, inArray, isNull, isNotNull, like, lt, or, sql } from 'drizzle-orm'
import { getDb } from './client'
import { inboxMessages, products } from './schema'
import { dbNow } from './db-now'
import { offerPrice } from './products'
import { logActivitySafe } from '@/lib/audit'
import { INBOX_PAGE_SIZE, type InboxPayload, type InboxType, type PricedProduct } from '@/modules/inbox/schema'

export type InboxRow = typeof inboxMessages.$inferSelect

export interface InboxFilters {
  type?: InboxType
  unreadOnly?: boolean
  includeHidden?: boolean
  from: Date
  toExclusive: Date
  search?: string
}

function buildWhere(f: InboxFilters) {
  const term = f.search?.trim()
  return and(
    isNull(inboxMessages.deletedAt),
    gte(inboxMessages.createdAt, f.from),
    lt(inboxMessages.createdAt, f.toExclusive),
    f.type ? eq(inboxMessages.type, f.type) : undefined,
    f.unreadOnly ? isNull(inboxMessages.readAt) : undefined,
    f.includeHidden ? undefined : isNull(inboxMessages.hiddenAt),
    term ? or(like(inboxMessages.name, `%${term}%`), like(inboxMessages.phone, `%${term}%`)) : undefined,
  )
}

export async function insertInboxMessage(values: {
  type: InboxType
  name: string
  phone: string
  payload: InboxPayload
  ip: string | null
}) {
  const db = await getDb()
  await db.insert(inboxMessages).values(values)
}

export async function countRecentByIp(ip: string, minutes: number) {
  const db = await getDb()
  const [row] = await db
    .select({ n: count() })
    .from(inboxMessages)
    .where(and(eq(inboxMessages.ip, ip), sql`${inboxMessages.createdAt} >= now() - interval ${minutes} minute`))
  return row?.n ?? 0
}

/** Precio vigente (con descuento activo) de productos activos y no eliminados. */
export async function getPricedProducts(ids: number[]): Promise<PricedProduct[]> {
  if (ids.length === 0) return []
  const db = await getDb()
  const rows = await db
    .select({
      id: products.id,
      code: products.code,
      title: products.title,
      slug: products.slug,
      price: products.price,
      discountPct: products.discountPct,
      discountUntil: products.discountUntil,
    })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.isActive, true), isNull(products.deletedAt)))

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    slug: r.slug,
    unitPrice: offerPrice(r.price, r.discountPct, r.discountUntil) ?? Number(r.price),
  }))
}

export async function listInbox(filters: InboxFilters, page: number) {
  const db = await getDb()
  const where = buildWhere(filters)
  const [rows, [totalRow]] = await Promise.all([
    db.select().from(inboxMessages).where(where)
      .orderBy(desc(inboxMessages.createdAt), desc(inboxMessages.id))
      .limit(INBOX_PAGE_SIZE)
      .offset((page - 1) * INBOX_PAGE_SIZE),
    db.select({ n: count() }).from(inboxMessages).where(where),
  ])
  return { rows, total: totalRow?.n ?? 0 }
}

/** Contador del badge: no leídos, no ocultos, no eliminados, sin filtro de fecha. */
export async function countUnread() {
  const db = await getDb()
  const [row] = await db
    .select({ n: count() })
    .from(inboxMessages)
    .where(and(isNull(inboxMessages.readAt), isNull(inboxMessages.hiddenAt), isNull(inboxMessages.deletedAt)))
  return row?.n ?? 0
}

export async function getInboxMessage(id: number) {
  const db = await getDb()
  return db.query.inboxMessages.findFirst({
    where: and(eq(inboxMessages.id, id), isNull(inboxMessages.deletedAt)),
  })
}

export async function setInboxRead(id: number, read: boolean) {
  const db = await getDb()
  await db.update(inboxMessages).set({ readAt: read ? dbNow() : null }).where(eq(inboxMessages.id, id))
}

export async function setInboxHidden(id: number, hidden: boolean) {
  const db = await getDb()
  await db.update(inboxMessages).set({ hiddenAt: hidden ? dbNow() : null }).where(eq(inboxMessages.id, id))
}

export async function softDeleteInboxMessage(id: number) {
  const db = await getDb()
  const before = await getInboxMessage(id)
  await db.update(inboxMessages).set({ deletedAt: dbNow() }).where(eq(inboxMessages.id, id))
  await logActivitySafe('DELETE', 'inbox_messages', id, before as Record<string, unknown> | undefined)
}

export async function markAllInboxRead(filters: InboxFilters) {
  const db = await getDb()
  await db.update(inboxMessages).set({ readAt: dbNow() })
    .where(and(buildWhere(filters), isNull(inboxMessages.readAt)))
}
```

Si `isNotNull` queda sin usar, quitarlo del import (lint).

- [ ] **Step 5: Permiso de ruta y rutas**

`proxy.ts`, dentro de `routePermissions`, después de `'/admin/orders'`:

```ts
  '/admin/inbox':         { module: 'inbox',          action: 'can_view' },
```

`lib/routes.ts`, después de `orders: {...},`:

```ts
    inbox: {
      index: '/admin/inbox',
      detail: (id: number | string) => `/admin/inbox/${id}`,
    },
```

- [ ] **Step 6: Aplicar el parche y verificar tipos**

Run: `npm run db:patch:inbox`
Expected: `OK: tabla inbox_messages`, `OK: módulo inbox`, `OK: permisos superadmin/admin` y una tabla con 2 filas (superadmin, admin) con `can_view=1, can_edit=1, can_delete=1`.

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add lib/db/schema.ts lib/db/scripts/apply-inbox-table.ts lib/db/products.ts lib/db/inbox.ts proxy.ts lib/routes.ts package.json
git commit -m "Bandeja: tabla inbox_messages, parche con módulo y permisos, repositorio"
```

---

### Task 3: Server Action público `submitInboxMessage`

**Files:**
- Create: `modules/inbox/server/actions.ts`

**Interfaces:**
- Consumes: `inboxSubmissionSchema`, `InboxSubmissionInput`, `buildCartSnapshot`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MIN` (Task 1); `insertInboxMessage`, `countRecentByIp`, `getPricedProducts` (Task 2); `ActionResult`, `errorResult`, `successResult` (`modules/admin/shared/types/action-result.ts`)
- Produces: `submitInboxMessage(input: InboxSubmissionInput & { website?: string }): Promise<ActionResult>`

- [ ] **Step 1: Leer la guía de Server Actions de Next 16**

Run: `ls node_modules/next/dist/docs/ && grep -ril "use server" node_modules/next/dist/docs | head`
Leer la guía de Server Functions/Actions y la de `headers()` para confirmar que `headers()` es async y usable en un action.

- [ ] **Step 2: Implementar**

```ts
'use server'

import { headers } from 'next/headers'
import { logger } from '@/lib/logger'
import { countRecentByIp, getPricedProducts, insertInboxMessage } from '@/lib/db/inbox'
import { errorResult, successResult, type ActionResult } from '@/modules/admin/shared/types/action-result'
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MIN,
  buildCartSnapshot,
  inboxSubmissionSchema,
  type InboxSubmissionInput,
} from '@/modules/inbox/schema'

async function clientIp() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim()
  return ip ? ip.slice(0, 45) : null
}

/** Registra un lead del sitio público en la bandeja del admin. */
export async function submitInboxMessage(input: InboxSubmissionInput & { website?: string }): Promise<ActionResult> {
  // Honeypot: un bot llena el campo oculto. Se responde "ok" para que no reintente.
  if (input.website) return successResult('Recibido.')

  const parsed = inboxSubmissionSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      ;(fieldErrors[key] ??= []).push(issue.message)
    }
    return errorResult(parsed.error.issues[0]?.message ?? 'Revisa los datos del formulario.', fieldErrors)
  }

  try {
    const ip = await clientIp()
    if (ip && (await countRecentByIp(ip, RATE_LIMIT_WINDOW_MIN)) >= RATE_LIMIT_MAX) {
      return errorResult('Demasiados intentos, intenta en unos minutos.')
    }

    const data = parsed.data
    if (data.type === 'cart') {
      const rows = await getPricedProducts(data.items.map((item) => item.id))
      const payload = buildCartSnapshot(data.items, rows)
      if (payload.items.length === 0) {
        return errorResult('Los productos de tu pedido ya no están disponibles.')
      }
      await insertInboxMessage({ type: 'cart', name: data.name, phone: data.phone, payload, ip })
    } else {
      await insertInboxMessage({ type: 'part_request', name: data.name, phone: data.phone, payload: data.payload, ip })
    }

    return successResult('Recibido.')
  } catch (err) {
    logger.error({ err, type: input.type }, 'Error saving inbox message')
    return errorResult('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.')
  }
}
```

- [ ] **Step 3: Verificar tipos y lint**

Run: `npx tsc --noEmit && npx eslint modules/inbox`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add modules/inbox/server/actions.ts
git commit -m "Bandeja: server action público con honeypot, límite por IP y precios del servidor"
```

---

### Task 4: `RequestPartForm` envía a la bandeja

**Files:**
- Modify: `lib/analytics.ts` (agregar `trackLead`)
- Modify: `components/RequestPartForm.tsx`

**Interfaces:**
- Consumes: `submitInboxMessage` (Task 3), `getWhatsAppUrl` (`@/lib/constants`), `trackWhatsApp` (`@/lib/analytics`)
- Produces: `trackLead(source: 'repuesto' | 'carrito'): void`

- [ ] **Step 1: `trackLead` en `lib/analytics.ts`**

Al final del archivo:

```ts
/** Envia el evento `lead_submit` a GA4 cuando un lead queda guardado en la bandeja. */
export function trackLead(source: "repuesto" | "carrito") {
  if (process.env.NODE_ENV !== "production") console.log("[lead]", source)
  window.gtag?.("event", "lead_submit", { lead_source: source, wa_page: window.location.pathname })
}
```

- [ ] **Step 2: Cambiar el formulario**

En `components/RequestPartForm.tsx`:

1. Imports: agregar `useTransition` a `react`, `trackLead` a `@/lib/analytics`, y
   ```ts
   import { submitInboxMessage } from "@/modules/inbox/server/actions"
   ```
2. Extraer el armado del mensaje de `handleSubmit` a una función a nivel de módulo, sin cambiar el texto:
   ```ts
   function buildWaMessage(form: FormData) {
     const vehiculoStr = [form.marcaVehiculo, form.modelo, form.anio, form.cilindraje].filter(Boolean).join(" ")
     return [
       `Hola! Necesito un repuesto que no encuentro en el catálogo.`,
       ``,
       `🔧 Repuesto necesario: ${form.repuesto}`,
       vehiculoStr && `🚗 Vehículo: ${vehiculoStr}`,
       ``,
       `📋 Mis datos:`,
       `• Nombre: ${form.nombre}`,
       form.telefono && `• Teléfono: ${form.telefono}`,
       form.nota && ``,
       form.nota && `📝 Nota adicional: ${form.nota}`,
       ``,
       `¿Pueden ayudarme a conseguirlo?`,
     ].join("\n")
   }
   ```
3. Estado y envío, reemplazando el `handleSubmit` actual:
   ```ts
   const [sent, setSent] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [website, setWebsite] = useState("")
   const [pending, startTransition] = useTransition()

   function handleSubmit(e: React.FormEvent) {
     e.preventDefault()
     setError(null)
     startTransition(async () => {
       const result = await submitInboxMessage({
         type: "part_request",
         name: form.nombre,
         phone: form.telefono,
         website,
         payload: {
           repuesto: form.repuesto,
           marcaVehiculo: form.marcaVehiculo,
           modelo: form.modelo,
           anio: form.anio,
           cilindraje: form.cilindraje,
           nota: form.nota,
           searchQuery,
         },
       }).catch(() => ({ ok: false, message: "No pudimos enviar tu solicitud. Revisa tu conexión." }))

       if (!result.ok) {
         setError(result.message)
         return
       }
       trackLead("repuesto")
       setSent(true)
     })
   }

   function openWhatsApp() {
     trackWhatsApp("catalogo")
     window.open(getWhatsAppUrl(buildWaMessage(form)), "_blank")
   }
   ```
   Quitar el `setTimeout` que reseteaba `sent` (los datos ya quedaron guardados; la confirmación se queda).
4. `isValid`: agregar `&& form.telefono.trim()`.
5. Pantalla de éxito (`if (sent)`): reemplazar el texto por:
   ```tsx
   <p className="font-display font-bold text-navy text-xl">¡Solicitud recibida!</p>
   <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
     Un asesor te contactará pronto.
   </p>
   ```
   y, encima del botón "Hacer otra consulta", agregar:
   ```tsx
   <button
     type="button"
     onClick={openWhatsApp}
     className="inline-flex items-center gap-2 text-sm font-semibold text-wa hover:text-wa/80 transition-colors"
   >
     <MessageCircle size={16} />
     ¿Prefieres escribirnos ya? Abrir WhatsApp
   </button>
   ```
   El botón "Hacer otra consulta" además resetea el formulario a los valores iniciales (`repuesto: searchQuery`, el resto vacío) con `setForm`.
6. Banda navy: cambiar "Completa el formulario y te contactamos por WhatsApp." por "Déjanos tus datos y un asesor te contacta." y el bloque derecho (ícono + "WhatsApp") se elimina.
7. Teléfono: label "Teléfono / WhatsApp <span className="text-brand">*</span>" e `required` en el input.
8. Honeypot, justo después de `<form ...>`:
   ```tsx
   <input
     type="text"
     name="website"
     value={website}
     onChange={(e) => setWebsite(e.target.value)}
     tabIndex={-1}
     autoComplete="off"
     aria-hidden="true"
     className="hidden"
   />
   ```
9. Botón submit: `disabled={!isValid || pending}`, ícono `Send`, texto `{pending ? "Enviando…" : "Enviar solicitud"}`. El color pasa de `bg-wa hover:bg-wa/90` a `bg-brand hover:bg-brand/90` (ya no es un botón de WhatsApp).
10. Error, justo encima del botón submit:
    ```tsx
    {error && (
      <div role="alert" className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
        <p>{error}</p>
        <button type="button" onClick={openWhatsApp} className="self-start font-semibold text-wa hover:text-wa/80">
          Enviar por WhatsApp
        </button>
      </div>
    )}
    ```
11. Nota al pie: "Campos con * son obligatorios. Respondemos en < 24h en días laborables." se mantiene.

- [ ] **Step 3: Verificar en el navegador**

Run: `npm run dev`. Abrir `http://localhost:3000/catalogo?search=zzzzqqq` (búsqueda sin resultados).
- Llenar repuesto, marca, nombre, teléfono `099 123 4567` → "Enviar solicitud" → aparece "¡Solicitud recibida!".
- "Abrir WhatsApp" abre wa.me con el mensaje de siempre.
- Con teléfono `12` → el error del servidor se muestra y los datos quedan.

Verificar en MySQL: `SELECT id,type,name,phone,payload FROM inbox_messages ORDER BY id DESC LIMIT 1;` → fila `part_request` con `phone = 0991234567`.

- [ ] **Step 4: Commit**

```bash
git add lib/analytics.ts components/RequestPartForm.tsx
git commit -m "Bandeja: el formulario de repuesto no encontrado guarda el lead y ofrece WhatsApp después"
```

---

### Task 5: `CartDrawer` envía el pedido a la bandeja

**Files:**
- Modify: `components/CartDrawer.tsx`

**Interfaces:**
- Consumes: `submitInboxMessage` (Task 3), `trackLead` (Task 4), `useCart()` → `{ cart, dispatch, total, itemCount, buildWhatsAppUrl }`

- [ ] **Step 1: Implementar**

1. Imports: `useEffect, useState, useTransition` de `react`; `CheckCircle` de `lucide-react`; `trackLead` de `@/lib/analytics`; `submitInboxMessage` de `@/modules/inbox/server/actions`.
2. A nivel de módulo:
   ```ts
   const CONTACT_KEY = "eca_contact"

   // ponytail: localStorage solo para no reescribir nombre/teléfono; si falla, no pasa nada.
   function readContact(): { name: string; phone: string } {
     try {
       const raw = localStorage.getItem(CONTACT_KEY)
       return raw ? JSON.parse(raw) : { name: "", phone: "" }
     } catch {
       return { name: "", phone: "" }
     }
   }
   ```
3. En el componente:
   ```ts
   const [name, setName] = useState("")
   const [phone, setPhone] = useState("")
   const [website, setWebsite] = useState("")
   const [error, setError] = useState<string | null>(null)
   const [sentWaUrl, setSentWaUrl] = useState<string | null>(null)
   const [pending, startTransition] = useTransition()

   useEffect(() => {
     const saved = readContact()
     setName(saved.name)
     setPhone(saved.phone)
   }, [])

   function handleClose() {
     setSentWaUrl(null)
     setError(null)
     onClose()
   }

   function handleSubmit(e: React.FormEvent) {
     e.preventDefault()
     setError(null)
     const waUrl = buildWhatsAppUrl()
     startTransition(async () => {
       const result = await submitInboxMessage({
         type: "cart",
         name,
         phone,
         website,
         items: cart.map((i) => ({ id: i.id, qty: i.qty })),
       }).catch(() => ({ ok: false, message: "No pudimos enviar tu pedido. Revisa tu conexión." }))

       if (!result.ok) {
         setError(result.message)
         return
       }
       try { localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, phone })) } catch {}
       trackLead("carrito")
       setSentWaUrl(waUrl)
       dispatch({ type: "CLEAR" })
     })
   }
   ```
4. `<Sheet onOpenChange={(v) => !v && handleClose()}>`.
5. Contenido central: si `sentWaUrl` existe, renderizar en lugar de la lista/estado vacío:
   ```tsx
   <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
     <div className="w-14 h-14 bg-wa/10 rounded-full flex items-center justify-center">
       <CheckCircle size={28} className="text-wa" />
     </div>
     <div>
       <p className="font-display font-bold text-navy text-lg">¡Pedido recibido!</p>
       <p className="text-slate-500 text-sm mt-1 max-w-xs">
         Un asesor te contactará pronto para confirmar disponibilidad y envío.
       </p>
     </div>
     <a
       href={sentWaUrl}
       data-wa="carrito"
       target="_blank"
       rel="noopener noreferrer"
       className="inline-flex items-center gap-2 text-sm font-semibold text-wa hover:text-wa/80 transition-colors"
     >
       <MessageCircle size={16} />
       ¿Prefieres escribirnos ya? Abrir WhatsApp
     </a>
   </div>
   ```
   (`data-wa="carrito"` mantiene el tracking delegado existente de clics de WhatsApp.)
6. Footer (`cart.length > 0`): envolver en `<form onSubmit={handleSubmit}>` y reemplazar el `<a>` de WhatsApp por:
   ```tsx
   <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
     tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
   <div className="grid grid-cols-2 gap-2">
     <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
       Nombre
       <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
         className="px-3 py-2 text-sm font-normal border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
     </label>
     <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
       Teléfono / WhatsApp
       <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"
         placeholder="09XX XXX XXX"
         className="px-3 py-2 text-sm font-normal border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
     </label>
   </div>
   {error && (
     <div role="alert" className="flex flex-col gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
       <p>{error}</p>
       <a href={buildWhatsAppUrl()} data-wa="carrito" target="_blank" rel="noopener noreferrer" className="font-semibold text-wa">
         Enviar por WhatsApp
       </a>
     </div>
   )}
   <button
     type="submit"
     disabled={pending || !name.trim() || !phone.trim()}
     className="flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-3 rounded-md transition-colors duration-150 active:scale-[0.98]"
   >
     <Send size={16} />
     {pending ? "Enviando…" : "Enviar pedido"}
   </button>
   ```
   Agregar `Send` al import de `lucide-react`. Quitar `MessageCircle` del import solo si queda sin uso (no debería: lo usan el éxito y el error).
7. El texto "El precio final y costo de envío son confirmados por el vendedor." se mantiene.

- [ ] **Step 2: Verificar en el navegador**

Con `npm run dev`: agregar 2 productos al carrito → abrir el drawer → nombre + teléfono → "Enviar pedido".
- Aparece "¡Pedido recibido!", el carrito queda vacío y el contador del navbar en 0.
- Cerrar y volver a abrir el drawer: estado vacío normal; al agregar otro producto, nombre/teléfono vienen precargados.
- `SELECT payload FROM inbox_messages WHERE type='cart' ORDER BY id DESC LIMIT 1;` → `items` con `unitPrice` igual al precio de la DB (con descuento si aplica) y `total` correcto.
- Rate limit: enviar 6 veces seguidas → la 6.ª muestra "Demasiados intentos, intenta en unos minutos."

- [ ] **Step 3: Commit**

```bash
git add components/CartDrawer.tsx
git commit -m "Bandeja: el carrito pide nombre y teléfono, guarda el pedido y ofrece WhatsApp después"
```

---

### Task 6: Acciones admin + listado `/admin/inbox`

**Files:**
- Create: `modules/admin/inbox/types.ts`
- Create: `modules/admin/inbox/server/actions.ts`
- Create: `modules/admin/inbox/components/InboxRowActions.tsx`
- Create: `modules/admin/inbox/components/MarkAllReadButton.tsx`
- Create: `app/admin/inbox/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`resolveInboxRange`, `ecuadorDayStart`, `addDays`, `summarizeInbox`, `INBOX_TYPE_LABEL`, `INBOX_TYPES`, `INBOX_PAGE_SIZE`, `InboxType`, `InboxPayload`); Task 2 (`listInbox`, `setInboxRead`, `setInboxHidden`, `softDeleteInboxMessage`, `markAllInboxRead`, `InboxFilters`, `routes.admin.inbox`); `todayInEcuador` (`@/lib/today-ecuador`); `ConfirmActionButton` (`@/modules/admin/orders/components/ConfirmActionButton`); `hasModulePermission`; `getJwtPayload`
- Produces:
  - `INBOX_PERMISSION_KEYS = ['inbox'] as const`
  - `setInboxReadAction(id: number, read: boolean): Promise<ActionResult>`
  - `setInboxHiddenAction(id: number, hidden: boolean): Promise<ActionResult>`
  - `deleteInboxMessageAction(id: number): Promise<ActionResult>`
  - `markAllInboxReadAction(params: InboxSearchParams): Promise<ActionResult>`
  - `interface InboxSearchParams { type?: string; unread?: string; hidden?: string; from?: string; to?: string; search?: string; page?: string }` y `filtersFromParams(params: InboxSearchParams, today: string): { filters: InboxFilters; range: { from: string; to: string }; page: number }` en `modules/admin/inbox/types.ts`

- [ ] **Step 1: `modules/admin/inbox/types.ts`**

```ts
import type { InboxFilters } from '@/lib/db/inbox'
import { addDays, ecuadorDayStart, INBOX_TYPES, resolveInboxRange, type InboxType } from '@/modules/inbox/schema'

export const INBOX_PERMISSION_KEYS = ['inbox'] as const

export interface InboxSearchParams {
  type?: string
  unread?: string
  hidden?: string
  from?: string
  to?: string
  search?: string
  page?: string
}

/** Query params → filtros de DB. Lo usan la página y la acción "marcar todo como leído". */
export function filtersFromParams(params: InboxSearchParams, today: string) {
  const range = resolveInboxRange(params, today)
  const type = INBOX_TYPES.find((t) => t === params.type) as InboxType | undefined
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const filters: InboxFilters = {
    type,
    unreadOnly: params.unread === '1',
    includeHidden: params.hidden === '1',
    from: ecuadorDayStart(range.from),
    toExclusive: ecuadorDayStart(addDays(range.to, 1)),
    search: params.search?.trim() || undefined,
  }
  return { filters, range, page }
}
```

`modules/admin/inbox/types.ts` importa un tipo de `lib/db/inbox` con `import type`, así que no arrastra la DB al cliente.

- [ ] **Step 2: `modules/admin/inbox/server/actions.ts`**

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { markAllInboxRead, setInboxHidden, setInboxRead, softDeleteInboxMessage } from '@/lib/db/inbox'
import { logger } from '@/lib/logger'
import { todayInEcuador } from '@/lib/today-ecuador'
import { errorResult, successResult, type ActionResult } from '@/modules/admin/shared/types/action-result'
import { hasModulePermission, type PermissionAction } from '@/modules/admin/shared/server/permissions'
import { filtersFromParams, INBOX_PERMISSION_KEYS, type InboxSearchParams } from '@/modules/admin/inbox/types'

// El badge vive en el layout del admin: se revalida todo el árbol /admin.
async function guarded(action: PermissionAction, denied: string, work: () => Promise<string>): Promise<ActionResult> {
  const payload = await getJwtPayload()
  if (!payload) return errorResult('Tu sesión expiró. Vuelve a iniciar sesión.')
  if (!hasModulePermission(payload, INBOX_PERMISSION_KEYS, action)) return errorResult(denied)

  try {
    const message = await work()
    revalidatePath('/admin', 'layout')
    return successResult(message)
  } catch (err) {
    logger.error({ err }, 'Inbox action failed')
    return errorResult('No se pudo completar la acción.')
  }
}

export async function setInboxReadAction(id: number, read: boolean) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await setInboxRead(id, read)
    return read ? 'Marcado como leído.' : 'Marcado como no leído.'
  })
}

export async function setInboxHiddenAction(id: number, hidden: boolean) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await setInboxHidden(id, hidden)
    return hidden ? 'Mensaje oculto.' : 'Mensaje visible otra vez.'
  })
}

export async function deleteInboxMessageAction(id: number) {
  return guarded('can_delete', 'No tienes permiso para eliminar mensajes.', async () => {
    await softDeleteInboxMessage(id)
    return 'Mensaje eliminado.'
  })
}

export async function markAllInboxReadAction(params: InboxSearchParams) {
  return guarded('can_edit', 'No tienes permiso para editar la bandeja.', async () => {
    await markAllInboxRead(filtersFromParams(params, todayInEcuador()).filters)
    return 'Todo marcado como leído.'
  })
}
```

Si `PermissionAction` no está exportado desde `permissions.ts`, sí lo está (`export type PermissionAction`); usarlo tal cual.

- [ ] **Step 3: `InboxRowActions.tsx`**

```tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, MailOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmActionButton } from '@/modules/admin/orders/components/ConfirmActionButton'
import {
  deleteInboxMessageAction,
  setInboxHiddenAction,
  setInboxReadAction,
} from '@/modules/admin/inbox/server/actions'
import type { ActionResult } from '@/modules/admin/shared/types/action-result'

interface Props {
  id: number
  isRead: boolean
  isHidden: boolean
  canEdit: boolean
  canDelete: boolean
  /** En el detalle se muestran con texto; en la tabla, solo íconos. */
  withLabels?: boolean
}

const iconBtn = 'inline-flex items-center gap-1.5 p-1.5 rounded-md text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors disabled:opacity-40 text-sm'

export function InboxRowActions({ id, isRead, isHidden, canEdit, canDelete, withLabels = false }: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) toast.error(result.message)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <>
          <button type="button" disabled={pending} className={iconBtn}
            onClick={() => run(() => setInboxReadAction(id, !isRead))}
            aria-label={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
            title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}>
            {isRead ? <Mail size={15} /> : <MailOpen size={15} />}
            {withLabels && (isRead ? 'No leído' : 'Leído')}
          </button>
          <button type="button" disabled={pending} className={iconBtn}
            onClick={() => run(() => setInboxHiddenAction(id, !isHidden))}
            aria-label={isHidden ? 'Mostrar' : 'Ocultar'}
            title={isHidden ? 'Mostrar' : 'Ocultar'}>
            {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
            {withLabels && (isHidden ? 'Mostrar' : 'Ocultar')}
          </button>
        </>
      )}
      {canDelete && (
        <ConfirmActionButton
          action={() => deleteInboxMessageAction(id)}
          trigger={<><Trash2 size={15} />{withLabels && 'Eliminar'}</>}
          triggerLabel="Eliminar"
          triggerClassName={`${iconBtn} hover:text-red-600! hover:bg-red-50!`}
          title="¿Eliminar este mensaje?"
          description="Dejará de aparecer en la bandeja. Si solo quieres sacarlo del listado, usa Ocultar."
          confirmLabel="Eliminar"
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: `MarkAllReadButton.tsx`**

```tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { markAllInboxReadAction } from '@/modules/admin/inbox/server/actions'
import type { InboxSearchParams } from '@/modules/admin/inbox/types'

export function MarkAllReadButton({ params }: { params: InboxSearchParams }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAllInboxReadAction(params)
          if (result.ok) toast.success(result.message)
          else toast.error(result.message)
          router.refresh()
        })
      }
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
    >
      <CheckCheck size={15} />
      Marcar todo como leído
    </button>
  )
}
```

- [ ] **Step 5: `app/admin/inbox/page.tsx`**

```tsx
import Link from 'next/link'
import { PackageSearch, ShoppingCart } from 'lucide-react'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { listInbox } from '@/lib/db/inbox'
import { routes } from '@/lib/routes'
import { todayInEcuador } from '@/lib/today-ecuador'
import { InboxRowActions } from '@/modules/admin/inbox/components/InboxRowActions'
import { MarkAllReadButton } from '@/modules/admin/inbox/components/MarkAllReadButton'
import { filtersFromParams, INBOX_PERMISSION_KEYS, type InboxSearchParams } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { INBOX_PAGE_SIZE, INBOX_TYPE_LABEL, summarizeInbox } from '@/modules/inbox/schema'

const dateFmt = new Intl.DateTimeFormat('es-EC', {
  timeZone: 'America/Guayaquil', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
})

const field = 'px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy'

export default async function InboxPage({ searchParams }: { searchParams: Promise<InboxSearchParams> }) {
  const params = await searchParams
  const { filters, range, page } = filtersFromParams(params, todayInEcuador())
  const [{ rows, total }, payload] = await Promise.all([listInbox(filters, page), getJwtPayload()])
  const canEdit = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_edit')
  const canDelete = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_delete')
  const pages = Math.max(1, Math.ceil(total / INBOX_PAGE_SIZE))

  const pageHref = (p: number) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][])
    qs.set('page', String(p))
    return `${routes.admin.inbox.index}?${qs}`
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Bandeja</h1>
          <p className="text-slate-400 text-sm mt-0.5">Solicitudes de repuestos y pedidos del carrito</p>
        </div>
        {canEdit && <MarkAllReadButton params={params} />}
      </div>

      {/* Form GET nativo: los filtros quedan en la URL y se pueden compartir. */}
      <form method="get" className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Tipo
          <select name="type" defaultValue={filters.type ?? ''} className={field}>
            <option value="">Todos</option>
            <option value="part_request">Solicitudes</option>
            <option value="cart">Pedidos de carrito</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Desde
          <input type="date" name="from" defaultValue={range.from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Hasta
          <input type="date" name="to" defaultValue={range.to} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 flex-1 min-w-48">
          Buscar
          <input type="search" name="search" defaultValue={filters.search ?? ''} placeholder="Nombre o teléfono" className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 py-2">
          <input type="checkbox" name="unread" value="1" defaultChecked={filters.unreadOnly} /> Solo no leídos
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 py-2">
          <input type="checkbox" name="hidden" value="1" defaultChecked={filters.includeHidden} /> Mostrar ocultos
        </label>
        <button type="submit" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition-colors">
          Filtrar
        </button>
        <Link href={routes.admin.inbox.index} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-navy">
          Últimos 30 días
        </Link>
      </form>

      <p className="text-xs text-slate-400 mb-2">{total} {total === 1 ? 'mensaje' : 'mensajes'}</p>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-white border border-slate-200 rounded-xl">
          No hay mensajes con estos filtros.
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {rows.map((row) => {
            const unread = !row.readAt
            const Icon = row.type === 'cart' ? ShoppingCart : PackageSearch
            return (
              <li key={row.id} className={`flex items-center gap-3 px-4 py-3 ${row.hiddenAt ? 'opacity-50' : ''}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${unread ? 'bg-brand' : 'bg-transparent'}`} aria-label={unread ? 'No leído' : undefined} />
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 ${
                  row.type === 'cart' ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon size={12} />
                  {INBOX_TYPE_LABEL[row.type]}
                </span>
                <Link href={routes.admin.inbox.detail(row.id)} className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${unread ? 'font-bold text-navy' : 'text-slate-700'}`}>
                    {row.name} <span className="font-normal text-slate-400">· {row.phone}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{summarizeInbox(row.type, row.payload)}</p>
                </Link>
                <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {row.createdAt ? dateFmt.format(row.createdAt) : ''}
                </span>
                <InboxRowActions id={row.id} isRead={!unread} isHidden={!!row.hiddenAt} canEdit={canEdit} canDelete={canDelete} />
              </li>
            )
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 mt-4 text-sm">
          {page > 1 && <Link href={pageHref(page - 1)} className="text-navy font-medium hover:underline">← Anterior</Link>}
          <span className="text-slate-400">Página {page} de {pages}</span>
          {page < pages && <Link href={pageHref(page + 1)} className="text-navy font-medium hover:underline">Siguiente →</Link>}
        </nav>
      )}
    </div>
  )
}
```

Nota: el spec decía "fecha relativa"; se usa fecha absoluta corta en hora de Ecuador (`dateFmt`) porque una relativa calculada en el servidor queda vieja en una página cacheada y no necesita JS. Es la simplificación elegida.

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npx eslint app/admin/inbox modules/admin/inbox`
Expected: sin errores.

Con `npm run dev`, entrar como admin (cerrar sesión y volver a entrar después del parche, para que el JWT traiga el permiso `inbox`) → `http://localhost:3000/admin/inbox`:
- Aparecen los leads de las Tasks 4–5, con su badge de tipo.
- Filtro "Pedidos de carrito" → solo carritos; la URL lleva `?type=cart`.
- "Desde" con una fecha posterior a los leads → "No hay mensajes con estos filtros".
- Ocultar → desaparece; con "Mostrar ocultos" vuelve, atenuado.
- Eliminar → diálogo → desaparece incluso con "Mostrar ocultos". `SELECT deleted_at FROM inbox_messages WHERE id=…` tiene valor y `audit_log` tiene una fila `DELETE inbox_messages`.

- [ ] **Step 7: Commit**

```bash
git add modules/admin/inbox app/admin/inbox/page.tsx
git commit -m "Bandeja: listado admin con filtros por tipo, fechas, no leídos y ocultos; leer, ocultar y eliminar"
```

---

### Task 7: Detalle `/admin/inbox/[id]`

**Files:**
- Create: `app/admin/inbox/[id]/page.tsx`

**Interfaces:**
- Consumes: `getInboxMessage`, `setInboxRead` (Task 2); `customerWhatsAppUrl`, `INBOX_TYPE_LABEL`, `CartPayload`, `PartRequestPayload` (Task 1); `InboxRowActions` (Task 6); `buildProductPath` (`@/lib/product-slugs`); `routes.admin.inbox`

- [ ] **Step 1: Implementar**

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getInboxMessage, setInboxRead } from '@/lib/db/inbox'
import { buildProductPath } from '@/lib/product-slugs'
import { routes } from '@/lib/routes'
import { InboxRowActions } from '@/modules/admin/inbox/components/InboxRowActions'
import { INBOX_PERMISSION_KEYS } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { customerWhatsAppUrl, INBOX_TYPE_LABEL, type CartPayload, type PartRequestPayload } from '@/modules/inbox/schema'

const dateFmt = new Intl.DateTimeFormat('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' })

export default async function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messageId = Number(id)
  if (!Number.isInteger(messageId)) notFound()

  const [message, payload] = await Promise.all([getInboxMessage(messageId), getJwtPayload()])
  if (!message) notFound()

  const canEdit = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_edit')
  const canDelete = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_delete')

  // ponytail: se marca leído al abrir. El badge del layout se renderiza en paralelo
  // y puede ir un número atrás hasta la siguiente navegación.
  if (canEdit && !message.readAt) await setInboxRead(message.id, true)

  const isCart = message.type === 'cart'
  const cart = message.payload as CartPayload
  const part = message.payload as PartRequestPayload
  const subject = isCart ? 'tu pedido' : `tu solicitud de ${part.repuesto}`
  const waUrl = customerWhatsAppUrl(message.phone, `Hola ${message.name}, te escribimos de El Chino Americano por ${subject}.`)

  const rows: [string, string][] = isCart ? [] : [
    ['Repuesto', part.repuesto],
    ['Vehículo', [part.marcaVehiculo, part.modelo, part.anio, part.cilindraje].filter(Boolean).join(' ')],
    ['Búsqueda', part.searchQuery],
    ['Nota', part.nota],
  ]

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <Link href={routes.admin.inbox.index} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy mb-4">
        <ArrowLeft size={14} /> Bandeja
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold mb-2 ${
              isCart ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-600'
            }`}>
              {INBOX_TYPE_LABEL[message.type]}
            </span>
            <h1 className="text-xl font-bold text-navy">{message.name}</h1>
            <p className="text-sm text-slate-500">{message.phone}</p>
            <p className="text-xs text-slate-400 mt-1">{message.createdAt ? dateFmt.format(message.createdAt) : ''}</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-wa hover:bg-wa/90 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageCircle size={16} /> Contactar por WhatsApp
          </a>
        </div>

        {isCart ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="py-2 font-semibold">Producto</th>
                <th className="py-2 font-semibold text-center">Cant.</th>
                <th className="py-2 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <a href={buildProductPath(item)} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">
                      {item.title}
                    </a>
                    <span className="block text-xs text-slate-400 font-mono">{item.code}</span>
                  </td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">${(item.unitPrice * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 text-right text-slate-500">Total estimado</td>
                <td className="pt-3 text-right font-bold text-navy">${cart.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-slate-700 whitespace-pre-line">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="border-t border-slate-100 pt-4">
          <InboxRowActions
            id={message.id}
            isRead
            isHidden={!!message.hiddenAt}
            canEdit={canEdit}
            canDelete={canDelete}
            withLabels
          />
        </div>
      </div>
    </div>
  )
}
```

`isRead` se pasa fijo en `true` porque al abrir ya queda leído; el botón ofrece "No leído". Tras eliminar desde el detalle, `router.refresh()` hace que `getInboxMessage` devuelva `undefined` → `notFound()`. Aceptable; si molesta, en una iteración futura se redirige a la bandeja.

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores.

En el navegador, abrir un lead no leído desde la bandeja:
- Se muestran los datos; un carrito trae la tabla con links a `/catalogo/<code>-<slug>`.
- "Contactar por WhatsApp" abre `wa.me/593…` con el saludo.
- Volver a la bandeja: la fila ya no está en negrita.
- "No leído" en el detalle → vuelve a negrita en la bandeja.

- [ ] **Step 3: Commit**

```bash
git add app/admin/inbox/\[id\]/page.tsx
git commit -m "Bandeja: detalle del lead con contacto por WhatsApp; se marca leído al abrir"
```

---

### Task 8: Badge de no leídos en el sidebar

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/_components/SidebarNav.tsx`
- Modify: `app/admin/_components/MobileAdminHeader.tsx`

**Interfaces:**
- Consumes: `countUnread()` (Task 2), `INBOX_PERMISSION_KEYS` (Task 6), `hasModulePermission`
- Produces: prop `unreadCount: number` en `SidebarNav` y `MobileAdminHeader`

- [ ] **Step 1: Layout**

En `app/admin/layout.tsx`:

```ts
import { countUnread } from '@/lib/db/inbox'
import { INBOX_PERMISSION_KEYS } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
```

Después de `const isSuperAdmin = ...`:

```ts
  // Si la tabla aún no existe (parche sin aplicar) el panel no debe caerse: badge en 0.
  const unreadCount = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_view')
    ? await countUnread().catch(() => 0)
    : 0
```

Pasar `unreadCount={unreadCount}` a `<SidebarNav ... />` y a `<MobileAdminHeader ... />`.

- [ ] **Step 2: SidebarNav**

1. Import `Inbox` de `lucide-react`.
2. En `NAV`, después de Dashboard:
   ```ts
   { href: '/admin/inbox',          label: 'Bandeja',          icon: Inbox },
   ```
3. Props: `unreadCount?: number` en `interface Props` y en la desestructuración (`unreadCount = 0`).
4. Dentro del `<Link>`, después de `{label}`:
   ```tsx
   {href === '/admin/inbox' && unreadCount > 0 && (
     <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
       {unreadCount > 99 ? '99+' : unreadCount}
     </span>
   )}
   ```

- [ ] **Step 3: MobileAdminHeader**

1. Props: `unreadCount: number`.
2. El botón de menú pasa a `relative` y agrega el punto:
   ```tsx
   <button
     onClick={() => setOpen(true)}
     className="relative text-white/70 hover:text-white transition-colors p-1"
     aria-label={unreadCount > 0 ? `Abrir menú (${unreadCount} sin leer)` : 'Abrir menú'}
   >
     <Menu size={20} />
     {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-brand" />}
   </button>
   ```
3. Pasar `unreadCount={unreadCount}` al `<SidebarNav>` interno.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

En el navegador:
- Con 2 leads no leídos, el sidebar muestra "Bandeja 2".
- Abrir uno → al navegar de nuevo muestra "1". "Marcar todo como leído" → el badge desaparece.
- Ocultar un no leído → deja de contar.
- Vista móvil (≤ 767px): punto rojo en el botón del menú; al abrirlo, el badge en "Bandeja".

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx app/admin/_components/SidebarNav.tsx app/admin/_components/MobileAdminHeader.tsx
git commit -m "Bandeja: ítem en el sidebar con badge de no leídos (y punto en el menú móvil)"
```

---

### Task 9: Documentación y verificación final

**Files:**
- Modify: `docs/admin-architecture.md`

- [ ] **Step 1: Documentar**

Agregar una sección a `docs/admin-architecture.md`, siguiendo el formato de las secciones de los otros módulos:

```md
## Bandeja (inbox)

Leads del sitio público: solicitudes de repuesto no encontrado (`RequestPartForm`) y pedidos del carrito (`CartDrawer`).

- Tabla `inbox_messages` (parche: `npm run db:patch:inbox`). `payload` JSON según `type` (`part_request` | `cart`).
- Entrada pública: `modules/inbox/server/actions.ts` → `submitInboxMessage` (honeypot `website`, 5 envíos/IP/10 min, precios del carrito recalculados en servidor).
- Lógica pura y su check: `modules/inbox/schema.ts`, `npm run check:inbox`.
- Admin: `app/admin/inbox` (listado y detalle), acciones en `modules/admin/inbox/server/actions.ts`, repositorio `lib/db/inbox.ts`.
- Estado leído compartido (`read_at`), ocultar reversible (`hidden_at`), borrado lógico (`deleted_at`, auditado).
- Badge: `app/admin/layout.tsx` → `countUnread()`.
- Futuro: Cloudflare Turnstile, notificaciones, estados de lead, convertir a Pedido.
```

- [ ] **Step 2: Verificación completa**

Run: `npm run check:inbox && npm run lint && npm run build`
Expected: `✓ bandeja OK`, lint sin errores, build exitoso.

- [ ] **Step 3: Commit**

```bash
git add docs/admin-architecture.md
git commit -m "Bandeja: documentación del módulo"
```
