import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { getOrderById } from '@/lib/db/orders'
import { ORDER_STATUS, buildOrderDocument } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { toAbsoluteUrl } from '@/lib/seo'
import { PrintLayout } from '@/modules/admin/orders/components/PrintLayout'

export default async function OrderDeliveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ print?: string }>
}) {
  const [{ id }, { print }] = await Promise.all([params, searchParams])
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await getOrderById(orderId)
  // El acta solo existe para un pedido entregado.
  if (!order || order.status !== ORDER_STATUS.delivered) notFound()

  const qrDataUrl = await QRCode.toDataURL(toAbsoluteUrl(routes.publicOrder(order.publicToken)), {
    margin: 0,
    width: 176,
  })

  return (
    <PrintLayout backHref={routes.admin.orders.detail(order.id)} autoPrint={print === '1'}>
      <OrderDocument kind="delivery" data={buildOrderDocument(order)} qrDataUrl={qrDataUrl} />
    </PrintLayout>
  )
}
