import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, Printer } from 'lucide-react'
import { getOrderById } from '@/lib/db/orders'
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  customerLabel,
  formatDate,
  formatDocNumber,
  formatMoney,
  orderSummary,
  toCents,
  type OrderStatus,
  type PaymentMethod,
} from '@/lib/orders'
import { routes } from '@/lib/routes'
import { toAbsoluteUrl } from '@/lib/seo'
import { todayInEcuador } from '@/lib/today-ecuador'
import { ConfirmActionButton } from '@/modules/admin/orders/components/ConfirmActionButton'
import { CopyLinkButton } from '@/modules/admin/orders/components/CopyLinkButton'
import { DeliveryForm } from '@/modules/admin/orders/components/DeliveryForm'
import { PaymentForm } from '@/modules/admin/orders/components/PaymentForm'
import {
  addPaymentAction,
  cancelOrderAction,
  saveDeliveryAction,
  voidPaymentAction,
} from '@/modules/admin/orders/server/actions'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'

const buttonClass =
  'inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const status = order.status as OrderStatus
  const summary = orderSummary(order)
  const isPending = status === ORDER_STATUS.pending
  const isDelivered = status === ORDER_STATUS.delivered
  const isCancelled = status === ORDER_STATUS.cancelled

  return (
    <div className="p-4 md:p-8 space-y-6">
      <AdminPageHeader
        backHref={routes.admin.orders.index}
        backLabel="Volver a pedidos"
        title={formatDocNumber('PED', order.id)}
        description={customerLabel(order.customerName)}
      />

      <div className="flex flex-wrap items-center gap-2 -mt-3">
        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${ORDER_STATUS_TONE[status]}`}>
          {ORDER_STATUS_LABEL[status]}
        </span>
        {isPending ? (
          <Link href={routes.admin.orders.edit(order.id)} className={buttonClass}>
            <Pencil size={14} />
            Editar
          </Link>
        ) : null}
        {isDelivered ? (
          <Link href={routes.admin.orders.delivery(order.id)} className={buttonClass}>
            <Printer size={14} />
            Imprimir acta de entrega
          </Link>
        ) : null}
        <CopyLinkButton url={toAbsoluteUrl(routes.publicOrder(order.publicToken))} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Total', formatMoney(summary.total)],
          ['Abonado', formatMoney(summary.paid)],
          ['Saldo pendiente', formatMoney(summary.balance)],
          ['Fecha estimada', formatDate(order.estimatedDate)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-lg font-bold text-navy mt-1 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <FormCard>
        <h2 className="text-sm font-bold text-navy mb-3">Ítems</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="text-left font-semibold pb-2">Descripción</th>
              <th className="text-right font-semibold pb-2">Cant.</th>
              <th className="text-right font-semibold pb-2">V. unitario</th>
              <th className="text-right font-semibold pb-2">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(toCents(item.unitPrice))}</td>
                <td className="py-2 text-right tabular-nums">{formatMoney(item.quantity * toCents(item.unitPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 ml-auto w-full max-w-xs text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums">{formatMoney(summary.subtotal)}</span>
          </div>
          {summary.discount > 0 ? (
            <div className="flex justify-between">
              <span className="text-slate-500">Descuento</span>
              <span className="tabular-nums">−{formatMoney(summary.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-navy border-t border-slate-200 pt-1">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(summary.total)}</span>
          </div>
        </div>
        {order.notes ? <p className="text-sm text-slate-500 mt-4 whitespace-pre-line">{order.notes}</p> : null}
      </FormCard>

      <FormCard>
        <h2 className="text-sm font-bold text-navy mb-3">Abonos</h2>
        {order.payments.length > 0 ? (
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                  <th className="text-left font-semibold pb-2">Recibo</th>
                  <th className="text-left font-semibold pb-2">Fecha</th>
                  <th className="text-left font-semibold pb-2">Forma de pago</th>
                  <th className="text-right font-semibold pb-2">Monto</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.payments.map((payment) => {
                  const voided = Boolean(payment.voidedAt)
                  const cell = voided ? 'py-2 text-slate-400 line-through' : 'py-2'

                  return (
                    <tr key={payment.id}>
                      <td className={`${cell} font-mono`}>{formatDocNumber('ABO', payment.id)}</td>
                      <td className={cell}>{formatDate(payment.paidAt)}</td>
                      <td className={cell}>
                        {PAYMENT_METHOD_LABEL[payment.method as PaymentMethod] ?? payment.method}
                        {payment.reference ? ` · ${payment.reference}` : ''}
                      </td>
                      <td className={`${cell} text-right tabular-nums`}>{formatMoney(toCents(payment.amount))}</td>
                      <td className="py-2">
                        {voided ? (
                          <span className="block text-right text-xs text-slate-400">Anulado</span>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={routes.admin.orders.receipt(order.id, payment.id)}
                              className="text-sm font-medium text-navy hover:underline whitespace-nowrap"
                            >
                              Imprimir recibo
                            </Link>
                            <ConfirmActionButton
                              action={voidPaymentAction.bind(null, order.id, payment.id)}
                              trigger="Anular"
                              title="Anular abono"
                              description={`El abono ${formatDocNumber('ABO', payment.id)} deja de contar para el saldo. No se puede deshacer.`}
                              confirmLabel="Anular abono"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-5">Todavía no hay abonos.</p>
        )}

        {!isCancelled && summary.balance > 0 ? (
          <PaymentForm
            action={addPaymentAction.bind(null, order.id)}
            today={todayInEcuador()}
            maxAmount={(summary.balance / 100).toFixed(2)}
          />
        ) : null}
      </FormCard>

      {!isCancelled ? (
        <FormCard>
          <h2 className="text-sm font-bold text-navy mb-1">Entrega</h2>
          <p className="text-xs text-slate-400 mb-4">
            {isDelivered
              ? `Entregado el ${formatDate(order.deliveredAt)}. Puedes completar la factura o las fotos después.`
              : 'Todos los campos son opcionales.'}
          </p>
          <DeliveryForm
            action={saveDeliveryAction.bind(null, order.id)}
            delivered={isDelivered}
            defaults={{
              receivedByName: order.receivedByName ?? undefined,
              receivedByIdNumber: order.receivedByIdNumber ?? undefined,
              invoiceNumber: order.invoiceNumber ?? undefined,
              photos: order.deliveryPhotos ?? [],
            }}
          />
        </FormCard>
      ) : null}

      {!isCancelled ? (
        <div className="flex justify-end">
          <ConfirmActionButton
            action={cancelOrderAction.bind(null, order.id)}
            trigger="Anular pedido"
            title="Anular pedido"
            description={
              isDelivered
                ? 'El pedido queda anulado y los productos del catálogo vuelven al inventario. No se puede deshacer.'
                : 'El pedido queda anulado. No se puede deshacer.'
            }
            confirmLabel="Anular pedido"
          />
        </div>
      ) : null}
    </div>
  )
}
