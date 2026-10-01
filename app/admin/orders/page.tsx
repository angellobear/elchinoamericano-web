import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdminSearchInput } from '@/app/admin/_components/AdminSearchInput'
import { listOrders } from '@/lib/db/orders'
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/lib/orders'
import { routes } from '@/lib/routes'
import { OrdersTable } from '@/modules/admin/orders/components/OrdersTable'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const { search, status } = await searchParams
  const statusFilter = ORDER_STATUSES.find((value) => value === status)
  const orders = await listOrders({ search, status: statusFilter })

  const tabs = [
    { label: 'Todos', href: routes.admin.orders.index, active: !statusFilter },
    ...ORDER_STATUSES.map((value) => ({
      label: ORDER_STATUS_LABEL[value],
      href: `${routes.admin.orders.index}?status=${value}`,
      active: statusFilter === value,
    })),
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Pedidos</h1>
          <p className="text-slate-400 text-sm mt-0.5">Abonos y entregas con recibí conforme</p>
        </div>
        <Link
          href={routes.admin.orders.create}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nuevo pedido
        </Link>
      </div>

      <AdminSearchInput defaultValue={search ?? ''} placeholder="Buscar por cliente, cédula, factura o n.º de pedido" />

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab.active ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
