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
  // Merge duplicate IDs: sum qty and clamp to 99, preserving first-seen order
  const merged = new Map<number, number>()
  const order: number[] = []
  for (const { id, qty } of requested) {
    if (!merged.has(id)) {
      order.push(id)
      merged.set(id, 0)
    }
    merged.set(id, Math.min((merged.get(id) ?? 0) + qty, 99))
  }
  const items = order.flatMap((id) => {
    const product = byId.get(id)
    const qty = merged.get(id) ?? 0
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

/** Valida que una fecha ISO sea válida (formato correcto y calendario posible) */
function isValidIsoDate(date: string): boolean {
  if (!ISO_DATE.test(date)) return false
  // Round-trip: si es fecha válida, debe convertirse a Date sin error y volver al mismo string
  try {
    const d = new Date(`${date}T00:00:00Z`)
    return d.toISOString().slice(0, 10) === date
  } catch {
    return false
  }
}

/** Rango del listado. Default: últimos 30 días con hoy incluido. Invertido se corrige. */
export function resolveInboxRange(params: { from?: string; to?: string }, today: string) {
  const to = params.to && isValidIsoDate(params.to) ? params.to : today
  const from = params.from && isValidIsoDate(params.from) ? params.from : addDays(to, -29)
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
