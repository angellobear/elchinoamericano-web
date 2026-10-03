#!/usr/bin/env npx tsx
// Verifica el dominio puro de pedidos: totales en centavos, descuento global,
// saldo sin abonos anulados, transiciones de estado y privacidad de la vista pública.
import assert from 'node:assert/strict'
import {
  buildOrderDocument,
  canTransition,
  customerLabel,
  formatDate,
  formatDocNumber,
  formatMoney,
  maskIdNumber,
  orderSummary,
  toCents,
} from '@/lib/orders'
import {
  parseDeliveryFormData,
  parseInvoiceFormData,
  parseOrderFormData,
  parsePaymentFormData,
} from '@/modules/admin/orders/form-schema'

const order = {
  id: 123,
  status: 'pending',
  customerName: 'Cliente de prueba',
  customerIdNumber: '0912345678',
  customerPhone: '0990000000',
  discount: '5.00',
  invoiceNumber: null,
  notes: null,
  estimatedDate: '2026-10-15',
  deliveredAt: null,
  receivedByName: null,
  receivedByIdNumber: null,
  deliveryPhotos: null,
  items: [
    { description: 'Bomba de agua', quantity: 1, unitPrice: '45.00' },
    { description: 'Kit de embrague', quantity: 2, unitPrice: '90.10' },
  ],
  payments: [
    { id: 1, amount: '100.00', method: 'transferencia', reference: '00458812', paidAt: '2026-10-01', voidedAt: null },
    { id: 2, amount: '50.00', method: 'efectivo', reference: null, paidAt: '2026-10-02', voidedAt: new Date() },
  ],
}

// Aritmética en centavos: 0.1 + 0.2 no debe filtrar errores de float.
assert.equal(toCents('0.10') + toCents('0.20'), 30)
assert.equal(toCents(19.99), 1999)
assert.equal(formatMoney(22020), '$220.20')

const summary = orderSummary(order)
assert.equal(summary.subtotal, 22520, '45.00 + 2 × 90.10')
assert.equal(summary.discount, 500)
assert.equal(summary.total, 22020, 'el descuento es global')
assert.equal(summary.paid, 10000, 'el abono anulado no cuenta')
assert.equal(summary.balance, 12020)

assert.equal(canTransition('pending', 'delivered'), true)
assert.equal(canTransition('pending', 'cancelled'), true)
assert.equal(canTransition('delivered', 'cancelled'), true)
assert.equal(canTransition('delivered', 'pending'), false)
assert.equal(canTransition('cancelled', 'pending'), false)
assert.equal(canTransition('cancelled', 'delivered'), false)

assert.equal(formatDocNumber('PED', 123), 'PED-000123')
assert.equal(formatDocNumber('ABO', 45), 'ABO-000045')
assert.equal(formatDate('2026-10-01'), '01/10/2026')
assert.equal(formatDate(null), '—')
assert.equal(maskIdNumber('0912345678'), '09******78')
assert.equal(maskIdNumber(null), null)
assert.equal(customerLabel(null), 'Consumidor final')
assert.equal(customerLabel('  '), 'Consumidor final')
assert.equal(customerLabel('Ana'), 'Ana')

const admin = buildOrderDocument(order)
assert.equal(admin.orderNumber, 'PED-000123')
assert.equal(admin.customerPhone, '0990000000')
assert.equal(admin.customerIdNumber, '0912345678')
assert.equal(admin.payments.length, 1, 'los abonos anulados no salen en documentos')
assert.equal(admin.payments[0].reference, '00458812')
assert.equal(admin.total, '$220.20')
assert.equal(admin.balance, '$120.20')
assert.equal(admin.hasDiscount, true)

const pub = buildOrderDocument(order, { publicView: true })
assert.equal(pub.customerPhone, null, 'la vista pública no expone el teléfono')
assert.equal(pub.customerIdNumber, '09******78', 'la vista pública enmascara la cédula')
assert.equal(pub.payments[0].reference, null, 'la vista pública no expone la referencia bancaria')

const anonymous = buildOrderDocument({ ...order, customerName: null, customerIdNumber: null })
assert.equal(anonymous.customerName, 'Consumidor final')
assert.equal(anonymous.customerIdNumber, null)

function orderForm(overrides: Record<string, string>) {
  const formData = new FormData()
  formData.set('discount', '0')
  formData.set('items', JSON.stringify([{ productId: null, description: 'Filtro', quantity: 1, unitPrice: '10.00' }]))
  for (const [key, value] of Object.entries(overrides)) formData.set(key, value)
  return formData
}

const consumidorFinal = parseOrderFormData(orderForm({}))
assert.equal(consumidorFinal.success, true, 'un pedido sin datos de cliente es válido')
assert.equal(consumidorFinal.data?.customerName, undefined)

assert.equal(parseOrderFormData(orderForm({ items: '[]' })).success, false, 'sin ítems no hay pedido')
assert.equal(parseOrderFormData(orderForm({ items: 'no es json' })).success, false)
assert.equal(parseOrderFormData(orderForm({ discount: '10.01' })).success, false, 'descuento mayor al subtotal')
assert.equal(parseOrderFormData(orderForm({ discount: '10.00' })).success, true, 'descuento igual al subtotal')
assert.equal(parseOrderFormData(orderForm({ discount: '5%' })).success, false, 'el descuento es en dólares, no porcentaje')
assert.equal(
  parseOrderFormData(orderForm({ items: JSON.stringify([{ productId: null, description: 'X', quantity: 0, unitPrice: '1.00' }]) })).success,
  false,
  'cantidad mínima 1',
)

function paymentForm(overrides: Record<string, string>) {
  const formData = new FormData()
  formData.set('amount', '25.50')
  formData.set('method', 'efectivo')
  formData.set('paidAt', '2026-10-01')
  for (const [key, value] of Object.entries(overrides)) formData.set(key, value)
  return formData
}

assert.equal(parsePaymentFormData(paymentForm({})).success, true)
assert.equal(parsePaymentFormData(paymentForm({ amount: '0' })).success, false, 'un abono de cero no es válido')
assert.equal(parsePaymentFormData(paymentForm({ amount: '-5' })).success, false)
assert.equal(parsePaymentFormData(paymentForm({ method: 'cheque' })).success, false)
assert.equal(parsePaymentFormData(paymentForm({ paidAt: '' })).success, false)

// Una entrega exige el nombre de quien recibe; la factura va aparte.
const emptyDelivery = new FormData()
assert.equal(parseDeliveryFormData(emptyDelivery).success, false, 'no se entrega sin decir quién recibe')
const blankDelivery = new FormData()
blankDelivery.set('receivedByName', '   ')
assert.equal(parseDeliveryFormData(blankDelivery).success, false, 'un nombre en blanco no cuenta')
const delivery = new FormData()
delivery.set('receivedByName', 'Ana Pérez')
assert.equal(parseDeliveryFormData(delivery).success, true)

// La factura se registra aparte; vacía significa quitarla.
const noInvoice = parseInvoiceFormData(new FormData())
assert.equal(noInvoice.success, true)
assert.equal(noInvoice.data?.invoiceNumber, undefined, 'sin número se quita la factura')
const invoice = new FormData()
invoice.set('invoiceNumber', ' 001-001-000000123 ')
assert.equal(parseInvoiceFormData(invoice).data?.invoiceNumber, '001-001-000000123', 'se recortan espacios')
const longInvoice = new FormData()
longInvoice.set('invoiceNumber', 'x'.repeat(51))
assert.equal(parseInvoiceFormData(longInvoice).success, false, 'máximo 50 caracteres')

// Documentos: solo aparece lo que existe.
assert.equal(admin.hasCustomerName, true)
assert.equal(anonymous.hasCustomerName, false, '"Consumidor final" no es un nombre para firmar')
assert.equal(admin.invoiceNumber, null, 'sin factura, la plantilla no pinta el campo')

console.log('✓ dominio de pedidos OK')
