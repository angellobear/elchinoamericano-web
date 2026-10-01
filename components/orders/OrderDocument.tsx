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
}

const LEGAL = 'Este documento no constituye comprobante de venta.'

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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  )
}

/** Plantilla única: recibo de abono, acta de entrega-recepción y estado público del pedido. */
export function OrderDocument({ kind, data, paymentId, qrDataUrl }: OrderDocumentProps) {
  const payment = kind === 'receipt' ? data.payments.find((item) => item.id === paymentId) : undefined
  const previousCents = payment
    ? data.payments.filter((item) => item.id < payment.id).reduce((sum, item) => sum + item.amountCents, 0)
    : 0

  const heading = {
    receipt: {
      title: 'Recibo de abono',
      number: payment?.number ?? '',
      detail: `Pedido ${data.orderNumber} · ${payment?.date ?? ''}`,
    },
    delivery: {
      title: 'Acta de entrega-recepción',
      number: formatDocNumber('ENT', data.orderId),
      detail: `Pedido ${data.orderNumber} · Entregado el ${formatDate(data.deliveredAt)}`,
    },
    status: {
      title: 'Estado de tu pedido',
      number: data.orderNumber,
      detail: data.deliveredAt ? `${data.statusLabel} el ${formatDate(data.deliveredAt)}` : data.statusLabel,
    },
  }[kind]

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

      <section className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 my-5">
        <Field label="Cliente" value={data.customerName} />
        <Field label="Cédula / RUC" value={data.customerIdNumber ?? '—'} />
        {kind === 'receipt' ? (
          <Field label="Teléfono" value={data.customerPhone ?? '—'} />
        ) : (
          <Field label="Factura n.º" value={data.invoiceNumber ?? '—'} />
        )}
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
              <p className="text-xs uppercase tracking-wide text-slate-400">Este abono</p>
              <p>
                {payment.method}
                {payment.reference ? ` · ref. ${payment.reference}` : ''}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400 mt-2">Fecha estimada de entrega</p>
              <p>{formatDate(data.estimatedDate)}</p>
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
              {kind === 'status' && data.status === ORDER_STATUS.pending ? (
                <p className="text-xs text-slate-500 mt-2">Fecha estimada de entrega: {formatDate(data.estimatedDate)}</p>
              ) : null}
            </>
          )}
        </div>

        <div>
          {data.hasDiscount ? (
            <>
              <Row label="Subtotal" value={data.subtotal} />
              <Row label="Descuento" value={`−${data.discount}`} />
            </>
          ) : null}
          <Row label="Total" value={data.total} />
          {payment ? (
            <>
              <Row label="Abonos anteriores" value={formatMoney(previousCents)} />
              <Row label="Este abono" value={payment.amount} />
              <Row
                label="Saldo pendiente"
                value={formatMoney(data.totalCents - previousCents - payment.amountCents)}
                strong
              />
            </>
          ) : (
            <>
              <Row label="Total abonado" value={data.paid} />
              <Row label="Saldo pendiente" value={data.balance} strong />
            </>
          )}
        </div>
      </section>

      {kind !== 'receipt' && data.photos.length > 0 ? (
        <section className="mt-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Fotos de la entrega</p>
          <div className="flex flex-wrap gap-3">
            {data.photos.map((url) => (
              <Image
                key={url}
                src={url}
                alt="Foto de la entrega"
                width={320}
                height={240}
                // eager: una imagen lazy puede no haber cargado cuando se manda a imprimir.
                loading="eager"
                className="h-40 w-52 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        </section>
      ) : null}

      {data.notes ? <p className="mt-5 text-xs text-slate-600 whitespace-pre-line">{data.notes}</p> : null}

      {kind === 'delivery' ? (
        <p className="mt-5">Declaro haber recibido a conformidad los productos detallados en este documento.</p>
      ) : null}

      <footer className="mt-4 flex items-end justify-between gap-6">
        <div className="flex-1">
          {kind === 'receipt' ? (
            <div className="mt-14 w-64 border-t border-slate-400 pt-1 text-xs text-slate-500">
              Firma y sello del local
            </div>
          ) : null}
          {kind === 'delivery' ? (
            <div className="mt-14 grid grid-cols-2 gap-8 text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1">
                Entregué conforme
                <br />
                Nombre:
              </div>
              <div className="border-t border-slate-400 pt-1">
                Recibí conforme
                <br />
                Nombre: {data.receivedByName ?? ''}
                <br />
                Cédula: {data.receivedByIdNumber ?? ''}
              </div>
            </div>
          ) : null}
          {kind === 'status' && data.receivedByName ? (
            <p className="text-xs text-slate-500">Recibido por: {data.receivedByName}</p>
          ) : null}

          <p className="mt-4 text-xs text-slate-500">
            {LEGAL}
            {kind === 'receipt' ? ' La factura se emitirá al momento de la entrega.' : ''}
          </p>
        </div>

        {qrDataUrl ? (
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL generada en el servidor; next/image no aporta nada */}
            <img src={qrDataUrl} alt="Código QR para verificar el pedido" width={88} height={88} />
            <p className="text-xs text-slate-500 mt-1">Verificar pedido</p>
          </div>
        ) : null}
      </footer>
    </article>
  )
}
