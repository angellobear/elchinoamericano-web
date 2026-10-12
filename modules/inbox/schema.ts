import { z } from 'zod'

// Lógica pura de la bandeja: sin DB ni Next, para poder probarla con tsx.

export const INBOX_TYPES = ['part_request', 'cart', 'whatsapp'] as const
export type InboxType = (typeof INBOX_TYPES)[number]

export const INBOX_TYPE_LABEL: Record<InboxType, string> = {
  part_request: 'Solicitud',
  cart: 'Pedido',
  whatsapp: 'Consulta',
}

// Límite por IP y por tipo en la ventana. Los clics de WhatsApp son más frecuentes.
export const RATE_LIMIT_MAX: Record<InboxType, number> = { part_request: 5, cart: 5, whatsapp: 20 }
export const RATE_LIMIT_WINDOW_MIN = 10
// Un registro idéntico (misma IP, tipo, datos) dentro de esta ventana se descarta. Corta para
// las consultas anónimas: detrás de una misma IP (CGNAT móvil) puede haber varios clientes.
export const DEDUPE_WINDOW_MIN: Record<InboxType, number> = { part_request: 10, cart: 10, whatsapp: 2 }
export const INBOX_PAGE_SIZE = 50

export function normalizePhone(raw: string) {
  return raw.trim().replace(/[\s\-().]/g, '')
}

// ponytail: el registro es silencioso; un texto demasiado largo se recorta en vez de perder el lead.
const clipped = (max: number) => z.string().max(10_000).transform((v) => v.trim().slice(0, max))
const requiredText = (max: number) => clipped(max).pipe(z.string().min(1))
const nameField = requiredText(120)
// ponytail: el registro es silencioso, así que un teléfono raro no se rechaza: se guarda
// normalizado tal cual lo escribió el cliente (opcional, máx. 30).
const lenientPhone = z.string().max(40).optional().default('').transform((v) => normalizePhone(v).slice(0, 30))
const optionalText = (max: number) => clipped(max).optional().default('')

export const partRequestPayloadSchema = z.object({
  repuesto: requiredText(200),
  marcaVehiculo: optionalText(60),
  modelo: optionalText(60),
  anio: optionalText(4),
  cilindraje: optionalText(30),
  nota: optionalText(500),
  searchQuery: optionalText(200),
  /** De dónde vino: 'catalogo' (repuesto no encontrado) o 'contacto'. */
  origen: optionalText(40),
})

export const whatsappPayloadSchema = z.object({
  source: requiredText(40),
  item: optionalText(100),
  page: optionalText(200),
})

export const inboxSubmissionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('part_request'),
    name: nameField,
    phone: lenientPhone,
    payload: partRequestPayloadSchema,
  }),
  z.object({
    type: z.literal('cart'),
    name: nameField,
    items: z
      .array(z.object({ id: z.number().int().positive(), qty: z.number().int().min(1).max(99) }))
      .min(1, 'Tu pedido está vacío.')
      .max(50, 'Tu pedido tiene demasiados productos.'),
  }),
  z.object({
    type: z.literal('whatsapp'),
    payload: whatsappPayloadSchema,
  }),
])

export type InboxSubmissionInput = z.input<typeof inboxSubmissionSchema>
export type InboxSubmission = z.output<typeof inboxSubmissionSchema>
export type PartRequestPayload = z.output<typeof partRequestPayloadSchema>
export type WhatsAppPayload = z.output<typeof whatsappPayloadSchema>

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

export type InboxPayload = PartRequestPayload | CartPayload | WhatsAppPayload

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
  if (type === 'whatsapp') {
    const wa = payload as WhatsAppPayload
    return wa.item ? `Botón ${wa.source} · ${wa.item}` : `Botón ${wa.source}`
  }
  if (type === 'cart') {
    const cart = payload as CartPayload
    const units = cart.items.reduce((sum, item) => sum + item.qty, 0)
    return `${units} ${units === 1 ? 'producto' : 'productos'} · $${cart.total.toFixed(2)}`
  }
  const part = payload as PartRequestPayload
  const vehicle = [part.marcaVehiculo, part.modelo, part.anio, part.cilindraje].filter(Boolean).join(' ')
  return vehicle ? `${part.repuesto} · ${vehicle}` : part.repuesto
}

/** WhatsApp exige el número internacional sin "+". Un 09xxxxxxxx de Ecuador pasa a 5939xxxxxxxx. */
export function customerWhatsAppUrl(phone: string, text: string) {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) digits = `593${digits.slice(1)}`
  if (digits.length === 9 && digits.startsWith('9')) digits = `593${digits}`
  // Fijo de Ecuador (02xxxxxxx): solo sirve si ese número tiene WhatsApp Business.
  else if (digits.length === 9 && digits.startsWith('0')) digits = `593${digits.slice(1)}`
  // Mismo endpoint que el sitio (api.whatsapp.com): wa.me rompe los emojis en la redirección.
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(text)}`
}
