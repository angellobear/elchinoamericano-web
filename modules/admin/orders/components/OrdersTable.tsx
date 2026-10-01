import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import type { OrderWithRelations } from '@/lib/db/orders'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  customerLabel,
  formatDocNumber,
  formatMoney,
  orderSummary,
  type OrderStatus,
} from '@/lib/orders'
import { routes } from '@/lib/routes'

const headClass = 'px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider'

export function OrdersTable({ orders }: { orders: OrderWithRelations[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className={`text-left ${headClass}`}>Pedido</th>
              <th className={`text-left ${headClass}`}>Cliente</th>
              <th className={`text-right ${headClass}`}>Total</th>
              <th className={`text-right ${headClass}`}>Abonado</th>
              <th className={`text-right ${headClass}`}>Saldo</th>
              <th className={`text-center ${headClass}`}>Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const summary = orderSummary(order)
              const status = order.status as OrderStatus

              return (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      href={routes.admin.orders.detail(order.id)}
                      className="font-mono font-medium text-navy hover:underline"
                    >
                      {formatDocNumber('PED', order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800">{customerLabel(order.customerName)}</p>
                    {order.customerIdNumber ? (
                      <p className="text-xs text-slate-400">{order.customerIdNumber}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">{formatMoney(summary.total)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-500">{formatMoney(summary.paid)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-medium">{formatMoney(summary.balance)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${ORDER_STATUS_TONE[status]}`}>
                      {ORDER_STATUS_LABEL[status]}
                    </span>
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <ClipboardList size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-400">No hay pedidos</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
