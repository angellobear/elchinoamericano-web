import Link from 'next/link'
import { Pencil, Truck } from 'lucide-react'
import type { SupplierListItem } from '@/modules/admin/suppliers/types'
import { SupplierDeleteButton } from '@/modules/admin/suppliers/components/SupplierDeleteButton'
import { SupplierStatusToggle } from '@/modules/admin/suppliers/components/SupplierStatusToggle'

interface SuppliersTableProps {
  suppliers: SupplierListItem[]
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Proveedor</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Contacto</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Teléfono</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3.5 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Truck size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{supplier.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-slate-500">{supplier.contactName ?? '—'}</td>
              <td className="px-4 py-3.5 text-slate-500">{supplier.email ?? '—'}</td>
              <td className="px-4 py-3.5 text-slate-500">{supplier.phone ?? '—'}</td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                  supplier.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {supplier.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </Link>
                  <SupplierStatusToggle id={supplier.id} isActive={supplier.isActive ?? true} />
                  <SupplierDeleteButton id={supplier.id} />
                </div>
              </td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr>
              <td colSpan={6} className="py-20 text-center">
                <Truck size={28} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">No hay proveedores registrados</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
