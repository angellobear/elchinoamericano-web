import { routes } from '@/lib/routes'
import { OrderForm } from '@/modules/admin/orders/components/OrderForm'
import { saveOrderAction } from '@/modules/admin/orders/server/actions'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'

export default function NewOrderPage() {
  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.orders.index}
        backLabel="Volver a pedidos"
        title="Nuevo pedido"
        description="Registra lo que se le cobra al cliente. Los abonos y la entrega se agregan después."
      />

      <FormCard>
        <OrderForm action={saveOrderAction.bind(null, null)} mode="create" cancelHref={routes.admin.orders.index} />
      </FormCard>
    </div>
  )
}
