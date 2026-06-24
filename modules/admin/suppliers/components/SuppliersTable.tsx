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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Proveedor</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Contacto</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Teléfono</th>
            <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
            <th className="px-4 py-3.5 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Truck size={13} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800">{supplier.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-500">{supplier.contactName ?? '—'}</td>
              <td className="px-4 py-3.5 text-gray-500">{supplier.email ?? '—'}</td>
              <td className="px-4 py-3.5 text-gray-500">{supplier.phone ?? '—'}</td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${supplier.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {supplier.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
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
              <td colSpan={6} className="py-16 text-center">
                <Truck size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400">No hay proveedores registrados</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
