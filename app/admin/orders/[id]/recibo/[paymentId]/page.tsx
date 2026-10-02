import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { getOrderById } from '@/lib/db/orders'
import { buildOrderDocument } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { toAbsoluteUrl } from '@/lib/seo'
import { PrintLayout } from '@/modules/admin/orders/components/PrintLayout'

export default async function OrderReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; paymentId: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const [{ id, paymentId }, { print }] = await Promise.all([params, searchParams])
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
    <PrintLayout backHref={routes.admin.orders.detail(order.id)} autoPrint={print === '1'}>
      <OrderDocument kind="receipt" data={data} paymentId={paymentNumber} qrDataUrl={qrDataUrl} />
    </PrintLayout>
  )
}
