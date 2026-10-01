// Dominio puro de pedidos: estados, totales y formato. Sin imports de servidor,
// para poder usarlo en scripts de verificación, en el admin y en la página pública.

export const ORDER_STATUS = {
  pending: 'pending',
  delivered: 'delivered',
  cancelled: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUSES = Object.values(ORDER_STATUS) as OrderStatus[]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  delivered: 'Entregado',
  cancelled: 'Anulado',
}

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return TRANSITIONS[from].includes(to)
}

export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'deposito', 'tarjeta'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  deposito: 'Depósito',
  tarjeta: 'Tarjeta',
}

export const MAX_DELIVERY_PHOTOS = 2
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024
export const CONSUMIDOR_FINAL = 'Consumidor final'
// 32 bytes en base64url = 43 caracteres. Se valida antes de consultar la base.
export const PUBLIC_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export interface DeliveryPhoto {
  url: string
  publicId: string
}

type Money = string | number

// Toda la aritmética va en centavos enteros: 0.1 + 0.2 en float no da 0.3.
export function toCents(value: Money) {
  return Math.round(Number(value) * 100)
}

export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export interface OrderTotalsInput {
  discount: Money
  items: { quantity: number; unitPrice: Money }[]
  payments: { amount: Money; voidedAt: unknown }[]
}

export function orderSummary(order: OrderTotalsInput) {
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * toCents(item.unitPrice), 0)
  const discount = toCents(order.discount)
  const total = subtotal - discount
  const paid = order.payments.reduce((sum, payment) => (payment.voidedAt ? sum : sum + toCents(payment.amount)), 0)

  return { subtotal, discount, total, paid, balance: total - paid }
}

export function formatDocNumber(prefix: 'PED' | 'ABO' | 'ENT', id: number) {
  return `${prefix}-${String(id).padStart(6, '0')}`
}

/** 'YYYY-MM-DD' → 'DD/MM/YYYY'. Trabaja sobre el texto para no depender de zonas horarias. */
export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export function maskIdNumber(value: string | null | undefined) {
  if (!value) return null
  if (value.length <= 4) return '*'.repeat(value.length)
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`
}

export function customerLabel(name: string | null | undefined) {
  return name?.trim() || CONSUMIDOR_FINAL
}

export interface OrderDocumentSource extends OrderTotalsInput {
  id: number
  status: string
  customerName: string | null
  customerIdNumber: string | null
  customerPhone: string | null
  invoiceNumber: string | null
  notes: string | null
  estimatedDate: string | null
  deliveredAt: string | null
  receivedByName: string | null
  receivedByIdNumber: string | null
  deliveryPhotos: DeliveryPhoto[] | null
  items: { description: string; quantity: number; unitPrice: Money }[]
  payments: {
    id: number
    amount: Money
    method: string
    reference: string | null
    paidAt: string
    voidedAt: unknown
  }[]
}

export interface OrderDocumentData {
  orderId: number
  orderNumber: string
  status: OrderStatus
  statusLabel: string
  customerName: string
  customerIdNumber: string | null
  customerPhone: string | null
  invoiceNumber: string | null
  notes: string | null
  estimatedDate: string | null
  deliveredAt: string | null
  receivedByName: string | null
  receivedByIdNumber: string | null
  photos: string[]
  items: { description: string; quantity: number; unitPrice: string; amount: string }[]
  subtotal: string
  discount: string
  hasDiscount: boolean
  total: string
  totalCents: number
  paid: string
  balance: string
  payments: {
    id: number
    number: string
    date: string
    method: string
    reference: string | null
    amount: string
    amountCents: number
  }[]
}

/**
 * Modelo ya formateado que pinta la plantilla del documento. Con `publicView` se quitan
 * teléfono y referencias bancarias y se enmascaran las cédulas.
 */
export function buildOrderDocument(
  order: OrderDocumentSource,
  options?: { publicView?: boolean },
): OrderDocumentData {
  const publicView = options?.publicView ?? false
  const summary = orderSummary(order)
  const status = order.status as OrderStatus

  return {
    orderId: order.id,
    orderNumber: formatDocNumber('PED', order.id),
    status,
    statusLabel: ORDER_STATUS_LABEL[status],
    customerName: customerLabel(order.customerName),
    customerIdNumber: publicView ? maskIdNumber(order.customerIdNumber) : order.customerIdNumber,
    customerPhone: publicView ? null : order.customerPhone,
    invoiceNumber: order.invoiceNumber,
    notes: order.notes,
    estimatedDate: order.estimatedDate,
    deliveredAt: order.deliveredAt,
    receivedByName: order.receivedByName,
    receivedByIdNumber: publicView ? maskIdNumber(order.receivedByIdNumber) : order.receivedByIdNumber,
    photos: (order.deliveryPhotos ?? []).map((photo) => photo.url),
    items: order.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: formatMoney(toCents(item.unitPrice)),
      amount: formatMoney(item.quantity * toCents(item.unitPrice)),
    })),
    subtotal: formatMoney(summary.subtotal),
    discount: formatMoney(summary.discount),
    hasDiscount: summary.discount > 0,
    total: formatMoney(summary.total),
    totalCents: summary.total,
    paid: formatMoney(summary.paid),
    balance: formatMoney(summary.balance),
    payments: order.payments
      .filter((payment) => !payment.voidedAt)
      .map((payment) => ({
        id: payment.id,
        number: formatDocNumber('ABO', payment.id),
        date: formatDate(payment.paidAt),
        method: PAYMENT_METHOD_LABEL[payment.method as PaymentMethod] ?? payment.method,
        reference: publicView ? null : payment.reference,
        amount: formatMoney(toCents(payment.amount)),
        amountCents: toCents(payment.amount),
      })),
  }
}
