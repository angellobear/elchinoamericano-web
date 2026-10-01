import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { getOrderById } from '@/lib/db/orders'
import { buildOrderDocument } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { toAbsoluteUrl } from '@/lib/seo'
import { PrintButton } from '@/modules/admin/orders/components/PrintButton'

export default async function OrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string; paymentId: string }>
}) {
  const { id, paymentId } = await params
  const orderId = Number(id)
  const paymentNumber = Number(paymentId)
  if (!Number.isInteger(orderId) || !Number.isInteger(paymentNumber)) notFound()

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const data = buildOrderDocument(order)
  // buildOrderDocument ya descarta los abonos anulados: un recibo anulado no se imprime.
  if (!data.payments.some((payment) => payment.id === paymentNumber)) notFound()

  const qrDataUrl = await QRCode.toDataURL(toAbsoluteUrl(routes.publicOrder(order.publicToken)), {
    margin: 0,
    width: 176,
  })

  return (
    <div className="p-4 md:p-8 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={routes.admin.orders.detail(order.id)} className="text-sm font-medium text-slate-500 hover:text-navy">
          ← Volver al pedido
        </Link>
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <OrderDocument kind="receipt" data={data} paymentId={paymentNumber} qrDataUrl={qrDataUrl} />
      </div>
    </div>
  )
}
