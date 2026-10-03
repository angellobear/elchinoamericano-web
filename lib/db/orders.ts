import { randomBytes } from 'crypto'
import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import { getDb } from './client'
import { orderItems, orderPayments, orders, products, stockMovements } from './schema'
import { dbNow } from './db-now'
import { logActivitySafe, withAudit } from '@/lib/audit'
import { todayInEcuador } from '@/lib/today-ecuador'
import {
  DELIVERY_EDIT_WINDOW_MINUTES,
  ORDER_STATUS,
  formatDocNumber,
  orderSummary,
  toCents,
  type DeliveryPhoto,
  type OrderStatus,
} from '@/lib/orders'

export interface OrderItemInput {
  productId: number | null
  description: string
  quantity: number
  unitPrice: string
}

export interface OrderInput {
  customerName: string | null
  customerIdNumber: string | null
  customerPhone: string | null
  discount: string
  notes: string | null
  estimatedDate: string | null
  items: OrderItemInput[]
}

export interface PaymentInput {
  amount: string
  method: string
  reference: string | null
  paidAt: string
}

export interface DeliveryInfoInput {
  receivedByName: string | null
  receivedByIdNumber: string | null
  invoiceNumber: string | null
  deliveryPhotos: DeliveryPhoto[]
}

export type OrderErrorCode =
  | 'NOT_FOUND'
  | 'NOT_PENDING'
  | 'NOT_DELIVERED'
  | 'DELIVERY_EDIT_EXPIRED'
  | 'CANCELLED'
  | 'TOTAL_BELOW_PAID'
  | 'EXCEEDS_BALANCE'
  | 'INSUFFICIENT_STOCK'

export class OrderError extends Error {
  constructor(
    public code: OrderErrorCode,
    public detail?: string,
  ) {
    super(code)
  }
}

type Tx = Parameters<Parameters<typeof withAudit>[0]>[0]

export async function getOrderById(id: number) {
  const db = await getDb()
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, payments: true },
  })
}

export type OrderWithRelations = NonNullable<Awaited<ReturnType<typeof getOrderById>>>

export async function getOrderByToken(token: string) {
  const db = await getDb()
  return db.query.orders.findFirst({
    where: eq(orders.publicToken, token),
    with: { items: true, payments: true },
  })
}

export async function listOrders(filters?: { search?: string; status?: OrderStatus }) {
  const db = await getDb()
  const search = filters?.search?.trim()
  // "PED-000123", "ped123" o "123" buscan por número de pedido.
  const numericId = search ? Number(search.replace(/^ped-?/i, '')) : NaN
  const pattern = `%${search ?? ''}%`

  return db.query.orders.findMany({
    where: and(
      filters?.status ? eq(orders.status, filters.status) : undefined,
      search
        ? or(
            sql`lower(coalesce(${orders.customerName}, '')) like lower(${pattern})`,
            sql`coalesce(${orders.customerIdNumber}, '') like ${pattern}`,
            sql`coalesce(${orders.invoiceNumber}, '') like ${pattern}`,
            Number.isInteger(numericId) && numericId > 0 ? eq(orders.id, numericId) : undefined,
          )
        : undefined,
    ),
    with: { items: true, payments: true },
    orderBy: desc(orders.id),
    // ponytail: sin paginación, los 200 más recientes. Paginar cuando el buscador no alcance.
    limit: 200,
  })
}

async function lockOrder(tx: Tx, id: number) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, id)).for('update')
  if (!order) throw new OrderError('NOT_FOUND')
  return order
}

async function loadSummary(tx: Tx, orderId: number, discount: string) {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId))
  const payments = await tx.select().from(orderPayments).where(eq(orderPayments.orderId, orderId))
  return { items, payments, summary: orderSummary({ discount, items, payments }) }
}

function itemRows(orderId: number, items: OrderItemInput[]) {
  return items.map((item) => ({
    orderId,
    productId: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))
}

export async function createOrder(input: OrderInput, userId: string) {
  const id = await withAudit(async (tx) => {
    const [result] = await tx.insert(orders).values({
      // 256 bits aleatorios, sin relación con el id: no se puede adivinar ni recorrer.
      publicToken: randomBytes(32).toString('base64url'),
      customerName: input.customerName,
      customerIdNumber: input.customerIdNumber,
      customerPhone: input.customerPhone,
      discount: input.discount,
      notes: input.notes,
      estimatedDate: input.estimatedDate,
      status: ORDER_STATUS.pending,
      createdBy: userId,
    })
    await tx.insert(orderItems).values(itemRows(result.insertId, input.items))
    return result.insertId
  })

  await logActivitySafe('CREATE', 'orders', id, undefined, { ...input }, { userId })
  return id
}

export async function updateOrder(id: number, input: OrderInput) {
  const before = await withAudit(async (tx) => {
    const order = await lockOrder(tx, id)
    if (order.status !== ORDER_STATUS.pending) throw new OrderError('NOT_PENDING')

    const { payments } = await loadSummary(tx, id, order.discount)
    const next = orderSummary({ discount: input.discount, items: input.items, payments })
    if (next.total < next.paid) throw new OrderError('TOTAL_BELOW_PAID')

    await tx
      .update(orders)
      .set({
        customerName: input.customerName,
        customerIdNumber: input.customerIdNumber,
        customerPhone: input.customerPhone,
        discount: input.discount,
        notes: input.notes,
        estimatedDate: input.estimatedDate,
        updatedAt: dbNow(),
      })
      .where(eq(orders.id, id))
    await tx.delete(orderItems).where(eq(orderItems.orderId, id))
    await tx.insert(orderItems).values(itemRows(id, input.items))

    return order
  })

  await logActivitySafe('UPDATE', 'orders', id, before as Record<string, unknown>, { ...input })
}

export async function addPayment(orderId: number, input: PaymentInput, userId: string) {
  const paymentId = await withAudit(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.status === ORDER_STATUS.cancelled) throw new OrderError('CANCELLED')

    const { summary } = await loadSummary(tx, orderId, order.discount)
    if (toCents(input.amount) > summary.balance) throw new OrderError('EXCEEDS_BALANCE')

    const [result] = await tx.insert(orderPayments).values({
      orderId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      paidAt: input.paidAt,
      userId,
    })
    return result.insertId
  })

  await logActivitySafe('CREATE', 'order_payments', paymentId, undefined, { orderId, ...input }, { userId })
  return paymentId
}

export async function voidPayment(orderId: number, paymentId: number) {
  await withAudit(async (tx) => {
    await lockOrder(tx, orderId)
    await tx
      .update(orderPayments)
      .set({ voidedAt: dbNow() })
      .where(and(eq(orderPayments.id, paymentId), eq(orderPayments.orderId, orderId), isNull(orderPayments.voidedAt)))
  })

  await logActivitySafe('DELETE', 'order_payments', paymentId, { orderId }, { voided: true })
}

/** Mueve el stock de los ítems de catálogo. Lanza si alguno quedaría negativo; la transacción revierte todo. */
async function moveStock(
  tx: Tx,
  orderId: number,
  direction: 'exit' | 'entry',
  reason: string,
  userId: string,
) {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId))
  const quantityByProduct = new Map<number, number>()

  for (const item of items) {
    if (item.productId == null) continue
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity)
  }

  if (quantityByProduct.size === 0) return

  const rows = await tx
    .select({ id: products.id, stock: products.stock, title: products.title })
    .from(products)
    .where(inArray(products.id, [...quantityByProduct.keys()]))
    .for('update')

  for (const row of rows) {
    const quantity = quantityByProduct.get(row.id) ?? 0
    const delta = direction === 'exit' ? -quantity : quantity

    if (row.stock + delta < 0) {
      throw new OrderError('INSUFFICIENT_STOCK', `${row.title}: hay ${row.stock}, el pedido necesita ${quantity}.`)
    }

    await tx.update(products).set({ stock: row.stock + delta, updatedAt: dbNow() }).where(eq(products.id, row.id))
    await tx.insert(stockMovements).values({
      productId: row.id,
      quantity: delta,
      movementType: direction,
      reason,
      userId,
    })
  }
}

export async function deliverOrder(orderId: number, userId: string) {
  await withAudit(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.status !== ORDER_STATUS.pending) throw new OrderError('NOT_PENDING')

    await moveStock(tx, orderId, 'exit', `Pedido ${formatDocNumber('PED', orderId)}`, userId)
    await tx
      .update(orders)
      .set({ status: ORDER_STATUS.delivered, deliveredAt: todayInEcuador(), updatedAt: dbNow() })
      .where(eq(orders.id, orderId))
  })

  await logActivitySafe('UPDATE', 'orders', orderId, { status: ORDER_STATUS.pending }, { status: ORDER_STATUS.delivered }, { userId })
}

// ponytail: `updated_at` hace de hora de entrega (`delivered_at` es solo fecha). `deliverOrder` lo
// pone en now() y nada más debe tocarlo después de entregar. Si eso deja de cumplirse, agregar
// una columna `delivered_time`. La ventana se evalúa en la base para no depender de zonas horarias.
async function withinDeliveryEditWindow(db: Pick<Tx, 'execute'>, orderId: number) {
  const [rows] = (await db.execute(
    sql`SELECT updated_at >= NOW() - INTERVAL ${DELIVERY_EDIT_WINDOW_MINUTES} MINUTE AS editable FROM orders WHERE id = ${orderId} AND status = ${ORDER_STATUS.delivered}`,
  )) as unknown as [{ editable: number | null }[]]
  return Boolean(rows[0]?.editable)
}

export async function isDeliveryEditable(orderId: number): Promise<boolean> {
  return withinDeliveryEditWindow(await getDb(), orderId)
}

export async function updateDeliveryInfo(orderId: number, input: DeliveryInfoInput) {
  await withAudit(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.status !== ORDER_STATUS.delivered) throw new OrderError('NOT_DELIVERED')
    if (!(await withinDeliveryEditWindow(tx, orderId))) throw new OrderError('DELIVERY_EDIT_EXPIRED')

    // Sin `updatedAt`: ver la nota de arriba.
    await tx
      .update(orders)
      .set({
        receivedByName: input.receivedByName,
        receivedByIdNumber: input.receivedByIdNumber,
        invoiceNumber: input.invoiceNumber,
        deliveryPhotos: input.deliveryPhotos,
      })
      .where(eq(orders.id, orderId))
  })

  await logActivitySafe('UPDATE', 'orders', orderId, undefined, { ...input })
}

/**
 * La factura va aparte de la entrega: se registra o corrige en cualquier momento (antes o después
 * de entregar, sin la ventana de 1 hora) mientras el pedido no esté anulado.
 */
export async function updateInvoiceNumber(orderId: number, invoiceNumber: string | null) {
  const before = await withAudit(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.status === ORDER_STATUS.cancelled) throw new OrderError('CANCELLED')

    // Sin `updatedAt`: en un pedido entregado guarda la hora de entrega (ver la nota de arriba).
    await tx.update(orders).set({ invoiceNumber }).where(eq(orders.id, orderId))
    return order.invoiceNumber
  })

  await logActivitySafe('UPDATE', 'orders', orderId, { invoiceNumber: before }, { invoiceNumber })
}

export async function cancelOrder(orderId: number, userId: string) {
  const previous = await withAudit(async (tx) => {
    const order = await lockOrder(tx, orderId)
    if (order.status === ORDER_STATUS.cancelled) throw new OrderError('CANCELLED')

    // Si ya se había entregado, la mercadería vuelve al inventario.
    if (order.status === ORDER_STATUS.delivered) {
      await moveStock(tx, orderId, 'entry', `Anulación pedido ${formatDocNumber('PED', orderId)}`, userId)
    }

    await tx.update(orders).set({ status: ORDER_STATUS.cancelled, updatedAt: dbNow() }).where(eq(orders.id, orderId))
    return order.status
  })

  await logActivitySafe('UPDATE', 'orders', orderId, { status: previous }, { status: ORDER_STATUS.cancelled }, { userId })
}
