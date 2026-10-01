import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { getOrderById } from '@/lib/db/orders'
import { ORDER_STATUS, buildOrderDocument } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { toAbsoluteUrl } from '@/lib/seo'
import { PrintButton } from '@/modules/admin/orders/components/PrintButton'

export default async function OrderDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    <div className="p-4 md:p-8 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={routes.admin.orders.detail(order.id)} className="text-sm font-medium text-slate-500 hover:text-navy">
          ← Volver al pedido
        </Link>
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <OrderDocument kind="delivery" data={buildOrderDocument(order)} qrDataUrl={qrDataUrl} />
      </div>
    </div>
  )
}
