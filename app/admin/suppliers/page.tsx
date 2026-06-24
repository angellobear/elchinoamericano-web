import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SuppliersTable } from '@/modules/admin/suppliers/components/SuppliersTable'
import { supplierRepository } from '@/modules/admin/suppliers/server/repository'

export default async function SuppliersPage() {
  const suppliers = await supplierRepository.listForAdmin()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} proveedores registrados</p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo proveedor
        </Link>
      </div>
      <SuppliersTable suppliers={suppliers} />
    </div>
  )
}
