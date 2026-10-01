import { notFound, redirect } from 'next/navigation'
import { getOrderById } from '@/lib/db/orders'
import { ORDER_STATUS, formatDocNumber } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { OrderForm } from '@/modules/admin/orders/components/OrderForm'
import { saveOrderAction } from '@/modules/admin/orders/server/actions'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId)) notFound()

  const order = await getOrderById(orderId)
  if (!order) notFound()
  // Un pedido entregado o anulado ya no se edita.
  if (order.status !== ORDER_STATUS.pending) redirect(routes.admin.orders.detail(order.id))

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.orders.detail(order.id)}
        backLabel="Volver al pedido"
        title={`Editar ${formatDocNumber('PED', order.id)}`}
      />

      <FormCard>
        <OrderForm
          action={saveOrderAction.bind(null, order.id)}
          mode="edit"
          cancelHref={routes.admin.orders.detail(order.id)}
          defaults={{
            customerName: order.customerName ?? undefined,
            customerIdNumber: order.customerIdNumber ?? undefined,
            customerPhone: order.customerPhone ?? undefined,
            discount: order.discount,
            notes: order.notes ?? undefined,
            estimatedDate: order.estimatedDate ?? undefined,
            items: order.items.map((item) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          }}
        />
      </FormCard>
    </div>
  )
}
