import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { ExternalLink, Pencil, Printer } from 'lucide-react'
import { DeliveryPhotos } from '@/components/orders/DeliveryPhotos'
import { getOrderById, isDeliveryEditable } from '@/lib/db/orders'
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
import { DeliveryPanel, PaymentPanel } from '@/modules/admin/orders/components/OrderPanels'
import {
  addPaymentAction,
  cancelOrderAction,
  saveDeliveryAction,
  voidPaymentAction,
} from '@/modules/admin/orders/server/actions'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'

const outlineButton =
  'inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors'
const dangerButton =
  'inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors'

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
  const photos = (order.deliveryPhotos ?? []).map((photo) => photo.url)
  const deliveryEditable = isDelivered && (await isDeliveryEditable(order.id))

  const publicPath = routes.publicOrder(order.publicToken)
  // El QR siempre lleva el dominio público, que es el que escanea el cliente.
  const publicUrl = toAbsoluteUrl(publicPath)
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 0, width: 240 })

  const deliveryDefaults = {
    receivedByName: order.receivedByName ?? undefined,
    invoiceNumber: order.invoiceNumber ?? undefined,
    photos: order.deliveryPhotos ?? [],
  }

  // Solo se listan los datos de entrega que existen.
  const deliveryFields = [
    ['Fecha de entrega', order.deliveredAt ? formatDate(order.deliveredAt) : null],
    ['Recibido por', order.receivedByName],
    ['Cédula', order.receivedByIdNumber],
    ['Factura n.º', order.invoiceNumber],
  ].filter((field): field is [string, string] => Boolean(field[1]))

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
        {!isCancelled && summary.balance > 0 ? (
          <PaymentPanel
            action={addPaymentAction.bind(null, order.id)}
            today={todayInEcuador()}
            maxAmount={(summary.balance / 100).toFixed(2)}
          />
        ) : null}
        {isPending ? (
          <DeliveryPanel action={saveDeliveryAction.bind(null, order.id)} delivered={false} defaults={deliveryDefaults} />
        ) : null}
        {/* Visible también antes de entregar: se imprime para que el cliente firme el recibí conforme. */}
        {!isCancelled ? (
          <Link href={`${routes.admin.orders.delivery(order.id)}?print=1`} className={outlineButton}>
            <Printer size={14} />
            Imprimir orden de entrega
          </Link>
        ) : null}
        {isPending ? (
          <Link href={routes.admin.orders.edit(order.id)} className={outlineButton}>
            <Pencil size={14} />
            Editar pedido
          </Link>
        ) : null}
        {!isCancelled ? (
          <div className="sm:ml-auto">
            <ConfirmActionButton
              action={cancelOrderAction.bind(null, order.id)}
              trigger="Anular pedido"
              triggerClassName={dangerButton}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Total', formatMoney(summary.total)],
          ['Abonado', formatMoney(summary.paid)],
          ['Saldo pendiente', formatMoney(summary.balance)],
          ...(order.estimatedDate ? [['Fecha estimada', formatDate(order.estimatedDate)]] : []),
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-lg font-bold text-navy mt-1 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FormCard>
            <h2 className="text-sm font-bold text-navy mb-3">Ítems</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="text-left font-semibold pb-2">Descripción</th>
                    <th className="text-right font-semibold pb-2 pl-3">Cant.</th>
                    <th className="text-right font-semibold pb-2 pl-3 whitespace-nowrap">V. unitario</th>
                    <th className="text-right font-semibold pb-2 pl-3">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{formatMoney(toCents(item.unitPrice))}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">
                        {formatMoney(item.quantity * toCents(item.unitPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 ml-auto w-full max-w-xs text-sm space-y-1">
              {summary.discount > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="tabular-nums">{formatMoney(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Descuento</span>
                    <span className="tabular-nums">−{formatMoney(summary.discount)}</span>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between font-bold text-navy border-t border-slate-200 pt-1">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(summary.total)}</span>
              </div>
            </div>
            {order.notes ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Condiciones u observaciones</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{order.notes}</p>
              </div>
            ) : null}
          </FormCard>
        </div>

        <FormCard>
          <h2 className="text-sm font-bold text-navy">Enlace público</h2>
          <p className="text-xs text-slate-400 mb-4">
            El cliente escanea este código (también va impreso en sus documentos) y ve el estado, los abonos y el saldo.
          </p>
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL generada en el servidor */}
            <img src={qrDataUrl} alt="Código QR del enlace público del pedido" width={140} height={140} />
            <div className="flex flex-wrap justify-center gap-2">
              <CopyLinkButton url={publicUrl} />
              {/* Ruta relativa: abre la página pública en el mismo dominio donde está el admin. */}
              <a href={publicPath} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                <ExternalLink size={14} />
                Abrir
              </a>
            </div>
          </div>
        </FormCard>
      </div>

      <FormCard>
        <h2 className="text-sm font-bold text-navy mb-3">Abonos</h2>
        {order.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                  <th className="text-left font-semibold pb-2">Recibo</th>
                  <th className="text-left font-semibold pb-2 pl-3">Fecha</th>
                  <th className="text-left font-semibold pb-2 pl-3">Forma de pago</th>
                  <th className="text-right font-semibold pb-2 pl-3">Monto</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.payments.map((payment) => {
                  const voided = Boolean(payment.voidedAt)
                  const cell = voided ? 'py-2.5 text-slate-400 line-through' : 'py-2.5'

                  return (
                    <tr key={payment.id}>
                      <td className={`${cell} font-mono whitespace-nowrap`}>{formatDocNumber('ABO', payment.id)}</td>
                      <td className={`${cell} pl-3 whitespace-nowrap`}>{formatDate(payment.paidAt)}</td>
                      <td className={`${cell} pl-3`}>
                        {PAYMENT_METHOD_LABEL[payment.method as PaymentMethod] ?? payment.method}
                        {payment.reference ? ` · ${payment.reference}` : ''}
                      </td>
                      <td className={`${cell} pl-3 text-right tabular-nums`}>{formatMoney(toCents(payment.amount))}</td>
                      <td className="py-2.5 pl-3">
                        {voided ? (
                          <span className="block text-right text-xs text-slate-400">Anulado</span>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            {/* Recibo PDF oculto a pedido del negocio; la ruta `routes.admin.orders.receipt` sigue existiendo. */}
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
          <p className="text-sm text-slate-400">Todavía no hay abonos.</p>
        )}
      </FormCard>

      {isDelivered ? (
        <FormCard>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy">Entrega</h2>
              <p className="text-xs text-slate-400">
                La orden de entrega se imprime con el botón de arriba. Las fotos no salen en el PDF.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {deliveryEditable ? (
                <DeliveryPanel action={saveDeliveryAction.bind(null, order.id)} delivered defaults={deliveryDefaults} />
              ) : (
                <p className="text-xs text-slate-400">
                  Los datos de entrega ya no se pueden editar (pasó 1 hora desde la entrega).
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            {deliveryFields.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {photos.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Evidencia de entrega</p>
              <DeliveryPhotos photos={photos} />
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Sin fotos de evidencia.</p>
          )}
        </FormCard>
      ) : null}
    </div>
  )
}
