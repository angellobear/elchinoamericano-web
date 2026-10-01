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

console.log('✓ dominio de pedidos OK')
