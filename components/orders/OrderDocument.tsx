import type { ReactNode } from 'react'
import Image from 'next/image'
import { contactInfo } from '@/lib/constants/contact'
import { SITE_NAME } from '@/lib/constants/site'
import { ORDER_STATUS, formatDate, formatDocNumber, formatMoney, type OrderDocumentData } from '@/lib/orders'

export type OrderDocumentKind = 'receipt' | 'delivery' | 'status'

interface OrderDocumentProps {
  kind: OrderDocumentKind
  data: OrderDocumentData
  /** Solo para `receipt`: el abono que respalda este recibo. */
  paymentId?: number
  qrDataUrl?: string
  /** Se pinta después de firmas y QR, justo antes de la línea legal. */
  children?: ReactNode
}

const LEGAL = 'Este documento no tiene validez tributaria.'

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={
        strong
          ? 'flex justify-between border-t border-slate-300 pt-1.5 mt-1 text-base font-bold text-navy'
          : 'flex justify-between py-0.5'
      }
    >
      <span className={strong ? undefined : 'text-slate-500'}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

/**
 * Plantilla única: recibo de abono, acta de entrega-recepción y estado público del pedido.
 * Regla general: un dato opcional solo se pinta si existe. Las fotos de evidencia no van
 * aquí (no salen en el PDF); se muestran aparte con `DeliveryPhotos`.
 */
export function OrderDocument({ kind, data, paymentId, qrDataUrl, children }: OrderDocumentProps) {
  const payment = kind === 'receipt' ? data.payments.find((item) => item.id === paymentId) : undefined
  const previousCents = payment
    ? data.payments.filter((item) => item.id < payment.id).reduce((sum, item) => sum + item.amountCents, 0)
    : 0
  const delivered = data.status === ORDER_STATUS.delivered
  const paidCents = data.payments.reduce((sum, item) => sum + item.amountCents, 0)
  const balanceCents = data.totalCents - paidCents

  const heading = {
    receipt: {
      title: 'Recibo de abono',
      number: payment?.number ?? '',
      detail: `Pedido ${data.orderNumber} · ${payment?.date ?? ''}`,
    },
    delivery: {
      title: 'Acta de entrega-recepción',
      number: formatDocNumber('ENT', data.orderId),
      // Se imprime antes de entregar (para que el cliente firme) y también después.
      detail: delivered
        ? `Pedido ${data.orderNumber} · Entregado el ${formatDate(data.deliveredAt)}`
        : `Pedido ${data.orderNumber}`,
    },
    status: {
      title: 'Estado de tu pedido',
      number: data.orderNumber,
      detail: delivered ? `${data.statusLabel} el ${formatDate(data.deliveredAt)}` : data.statusLabel,
    },
  }[kind]

  // "Cliente" siempre sale (como mínimo "Consumidor final"); el resto solo si existe.
  const fields = [
    ['Cliente', data.customerName],
    ['Cédula / RUC', data.customerIdNumber],
    ['Teléfono', data.customerPhone],
    ['Factura n.º', data.invoiceNumber],
  ].filter((field): field is [string, string] => Boolean(field[1]))

  // Quién firma el "Recibí conforme": en el acta, quien recibió; en el recibo, el cliente.
  const signer =
    kind === 'delivery'
      ? { name: data.receivedByName, idNumber: data.receivedByIdNumber }
      : { name: data.hasCustomerName ? data.customerName : null, idNumber: data.customerIdNumber }

  return (
    <article className="text-sm text-slate-800">
      {data.status === ORDER_STATUS.cancelled ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center font-semibold text-red-700">
          Pedido anulado
        </p>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo-ca.png" alt={SITE_NAME} width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <p className="text-base font-bold text-navy">{SITE_NAME}</p>
            <p className="text-xs text-slate-500">Repuestos automotrices</p>
            <p className="text-xs text-slate-500">
              {contactInfo.address.full} · {contactInfo.whatsappDisplay}
            </p>
          </div>
        </div>
        <div className="sm:text-right print:text-right">
          <h1 className="text-base font-bold text-navy">{heading.title}</h1>
          <p className="font-mono">{heading.number}</p>
          <p className="text-xs text-slate-500">{heading.detail}</p>
        </div>
      </header>

      <section className="flex flex-wrap gap-x-10 gap-y-3 my-5">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-slate-800">{value}</p>
          </div>
        ))}
      </section>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-300 text-xs uppercase tracking-wide text-slate-500">
            <th className="text-left font-semibold py-1.5">Descripción</th>
            <th className="text-right font-semibold py-1.5 w-14">Cant.</th>
            <th className="text-right font-semibold py-1.5 w-24">V. unitario</th>
            <th className="text-right font-semibold py-1.5 w-24">Importe</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-slate-100">
              <td className="py-1.5">{item.description}</td>
              <td className="py-1.5 text-right tabular-nums">{item.quantity}</td>
              <td className="py-1.5 text-right tabular-nums">{item.unitPrice}</td>
              <td className="py-1.5 text-right tabular-nums">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 mt-4">
        <div className="rounded-lg border border-slate-200 p-3">
          {payment ? (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400">Pago recibido</p>
              <p>
                {payment.date} · {payment.method}
                {payment.reference ? ` · ref. ${payment.reference}` : ''}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Pagos recibidos</p>
              {data.payments.length === 0 ? <p className="text-slate-500">Sin pagos registrados</p> : null}
              {data.payments.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 py-0.5">
                  <span>
                    {item.date} · {item.method} · {item.number}
                  </span>
                  <span className="tabular-nums">{item.amount}</span>
                </div>
              ))}
            </>
          )}
          {!delivered && data.estimatedDate ? (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400 mt-2">Fecha estimada de entrega</p>
              <p>{formatDate(data.estimatedDate)}</p>
            </>
          ) : null}
        </div>

        <div>
          {data.hasDiscount ? (
            <>
              <Row label="Subtotal" value={data.subtotal} />
              <Row label="Descuento" value={`−${data.discount}`} />
            </>
          ) : null}
          {/* En la orden de entrega y en la página pública lo destacado es el total; el saldo va discreto. */}
          <Row label="Total" value={data.total} strong={!payment} />
          {payment ? (
            <>
              <Row label="Abonos anteriores" value={formatMoney(previousCents)} />
              <Row label="Abono recibido" value={payment.amount} />
              <Row
                label="Saldo pendiente"
                value={formatMoney(data.totalCents - previousCents - payment.amountCents)}
                strong
              />
            </>
          ) : balanceCents > 0 ? (
            // Solo si falta pagar algo; pagado por completo (en uno o varios abonos) no se menciona.
            <p className="mt-2 text-right text-xs text-slate-500 tabular-nums">
              {paidCents > 0 ? `Abonado ${data.paid} · ` : ''}Saldo pendiente {data.balance}
            </p>
          ) : null}
        </div>
      </section>

      {kind === 'status' && delivered && data.receivedByName ? (
        <p className="mt-4 text-slate-600">
          Recibido por: {data.receivedByName}
          {data.receivedByIdNumber ? ` · Cédula ${data.receivedByIdNumber}` : ''}
        </p>
      ) : null}

      {data.notes ? <p className="mt-5 text-xs text-slate-600 whitespace-pre-line">{data.notes}</p> : null}

      {kind === 'delivery' ? (
        <p className="mt-5">Declaro haber recibido a conformidad los productos detallados en este documento.</p>
      ) : null}

      <footer className="mt-4 flex items-end justify-between gap-6">
        <div className="flex-1">
          {kind !== 'status' ? (
            <div className="mt-14 grid grid-cols-2 gap-8 text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1">Firma y sello del local</div>
              {/* Nombre y cédula quedan como líneas para llenar a mano si no se conocen. */}
              <div className="border-t border-slate-400 pt-1">
                Recibí conforme
                <br />
                Nombre: {signer.name ?? ''}
                <br />
                Cédula: {signer.idNumber ?? ''}
              </div>
            </div>
          ) : null}
        </div>

        {qrDataUrl ? (
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL generada en el servidor; next/image no aporta nada */}
            <img src={qrDataUrl} alt="Código QR para verificar el pedido" width={88} height={88} />
            <p className="text-xs text-slate-500 mt-1">Verificar pedido</p>
          </div>
        ) : null}
      </footer>

      {children}

      <p className="mt-4 text-center text-xs text-slate-500">{LEGAL}</p>
    </article>
  )
}
