// Chequeo de integración de pedidos contra la base LOCAL: abonos, saldo, entrega con
// descuento de inventario y reversa al anular. Se niega a correr fuera de localhost.
// Deja 2 pedidos anulados llamados "PRUEBA AUTOMÁTICA" y el stock exactamente como estaba.
//
// Correr con: npm run check:orders:db
// (el script npm precarga scripts/stub-server-only.cjs porque lib/audit arrastra `server-only`).
import assert from 'node:assert/strict'
import { sql } from 'drizzle-orm'
import { closeDb, getDb } from '@/lib/db/client'
import { loadDatabaseUrl } from '@/lib/db/config-env'
import {
  OrderError,
  addPayment,
  cancelOrder,
  createOrder,
  deliverOrder,
  getOrderById,
  getOrderByToken,
  listOrders,
  updateDeliveryInfo,
  updateOrder,
  voidPayment,
  type OrderErrorCode,
  type OrderInput,
} from '@/lib/db/orders'
import { PUBLIC_TOKEN_PATTERN, orderSummary } from '@/lib/orders'
import { todayInEcuador } from '@/lib/today-ecuador'

const USER = 'check-orders-db'
const CUSTOMER = 'PRUEBA AUTOMÁTICA (check-orders-db)'

async function rejectsWith(code: OrderErrorCode, work: () => Promise<unknown>) {
  await assert.rejects(work, (err: unknown) => err instanceof OrderError && err.code === code, `esperaba ${code}`)
}

async function summaryOf(id: number) {
  const order = await getOrderById(id)
  assert.ok(order, 'el pedido existe')
  return { order, summary: orderSummary(order) }
}

async function stockOf(productId: number) {
  const db = await getDb()
  const [rows] = (await db.execute(sql`SELECT stock FROM products WHERE id = ${productId}`)) as unknown as [
    { stock: number }[],
  ]
  return rows[0].stock
}

async function main() {
  const { url } = loadDatabaseUrl('local')
  const host = new URL(url).hostname
  assert.ok(['localhost', '127.0.0.1', '::1'].includes(host), `solo corre contra una base local, no contra ${host}`)

  const db = await getDb()
  const [products] = (await db.execute(
    sql`SELECT id, stock, title FROM products WHERE deleted_at IS NULL AND stock >= 1 ORDER BY id LIMIT 1`,
  )) as unknown as [{ id: number; stock: number; title: string }[]]
  const product = products[0]
  assert.ok(product, 'se necesita al menos un producto con stock en la base local')
  const initialStock = product.stock

  const input: OrderInput = {
    customerName: CUSTOMER,
    customerIdNumber: '0912345678',
    customerPhone: '0990000000',
    discount: '0.50',
    notes: null,
    estimatedDate: null,
    items: [
      { productId: product.id, description: product.title, quantity: 1, unitPrice: '10.00' },
      { productId: null, description: 'Ítem libre bajo pedido', quantity: 2, unitPrice: '5.25' },
    ],
  }

  // Creación: total = 10.00 + 2 × 5.25 − 0.50 = 20.00
  const id = await createOrder(input, USER)
  const created = await summaryOf(id)
  let order = created.order
  const summary = created.summary
  assert.equal(order.status, 'pending')
  assert.match(order.publicToken, PUBLIC_TOKEN_PATTERN, 'token de 43 caracteres base64url')
  assert.equal(order.items.length, 2)
  assert.equal(summary.total, 2000)
  assert.equal((await getOrderByToken(order.publicToken))?.id, id, 'se encuentra por token')
  assert.ok((await listOrders({ search: `PED-${id}` })).some((row) => row.id === id), 'se encuentra por número')
  assert.ok((await listOrders({ search: 'prueba automática' })).some((row) => row.id === id), 'se encuentra por cliente')

  // Abonos: no pueden superar el saldo; anular devuelve el saldo.
  const firstPayment = await addPayment(id, { amount: '8.00', method: 'efectivo', reference: null, paidAt: todayInEcuador() }, USER)
  assert.equal((await summaryOf(id)).summary.balance, 1200)
  await rejectsWith('EXCEEDS_BALANCE', () =>
    addPayment(id, { amount: '12.01', method: 'efectivo', reference: null, paidAt: todayInEcuador() }, USER),
  )
  await voidPayment(id, firstPayment)
  assert.equal((await summaryOf(id)).summary.balance, 2000, 'el abono anulado no cuenta')
  await addPayment(id, { amount: '20.00', method: 'transferencia', reference: 'REF-1', paidAt: todayInEcuador() }, USER)
  assert.equal((await summaryOf(id)).summary.balance, 0)

  // Editar no puede dejar el total por debajo de lo abonado.
  await rejectsWith('TOTAL_BELOW_PAID', () => updateOrder(id, { ...input, discount: '5.00' }))
  assert.equal((await summaryOf(id)).summary.total, 2000, 'la edición rechazada no cambia nada')

  // Entrega: descuenta stock del ítem de catálogo y registra el movimiento.
  await rejectsWith('NOT_DELIVERED', () =>
    updateDeliveryInfo(id, { receivedByName: null, receivedByIdNumber: null, invoiceNumber: null, deliveryPhotos: [] }),
  )
  await deliverOrder(id, USER)
  ;({ order } = await summaryOf(id))
  assert.equal(order.status, 'delivered')
  assert.equal(order.deliveredAt, todayInEcuador())
  assert.equal(await stockOf(product.id), initialStock - 1, 'la entrega descuenta 1 del inventario')
  await rejectsWith('NOT_PENDING', () => deliverOrder(id, USER))
  await rejectsWith('NOT_PENDING', () => updateOrder(id, input))

  await updateDeliveryInfo(id, {
    receivedByName: 'Quien recibe',
    receivedByIdNumber: '0999999999',
    invoiceNumber: '001-001-000000001',
    deliveryPhotos: [],
  })
  ;({ order } = await summaryOf(id))
  assert.equal(order.invoiceNumber, '001-001-000000001')
  assert.deepEqual(order.deliveryPhotos, [])

  // Anulación de un pedido entregado: la mercadería vuelve al inventario.
  await cancelOrder(id, USER)
  assert.equal((await summaryOf(id)).order.status, 'cancelled')
  assert.equal(await stockOf(product.id), initialStock, 'anular devuelve el stock')
  await rejectsWith('CANCELLED', () => cancelOrder(id, USER))
  await rejectsWith('CANCELLED', () =>
    addPayment(id, { amount: '1.00', method: 'efectivo', reference: null, paidAt: todayInEcuador() }, USER),
  )

  // Sin stock suficiente no se entrega nada.
  const bigId = await createOrder(
    { ...input, discount: '0', items: [{ productId: product.id, description: product.title, quantity: initialStock + 1, unitPrice: '1.00' }] },
    USER,
  )
  await rejectsWith('INSUFFICIENT_STOCK', () => deliverOrder(bigId, USER))
  assert.equal((await summaryOf(bigId)).order.status, 'pending', 'el pedido sigue pendiente')
  assert.equal(await stockOf(product.id), initialStock, 'el stock no se tocó')
  await cancelOrder(bigId, USER)
  assert.equal(await stockOf(product.id), initialStock, 'anular un pendiente no mueve stock')

  console.log(`✓ pedidos contra la base local OK (pedidos de prueba ${id} y ${bigId}, anulados)`)
  console.log(`  enlace público de prueba: /pedido/${order.publicToken}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => closeDb())
