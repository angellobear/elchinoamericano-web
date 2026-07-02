import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SuppliersTable } from '@/modules/admin/suppliers/components/SuppliersTable'
import { supplierRepository } from '@/modules/admin/suppliers/server/repository'
import { AdminSearchInput } from '@/app/admin/_components/AdminSearchInput'

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const all = await supplierRepository.listForAdmin()
  const suppliers = search
    ? all.filter((s) => {
        const q = search.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.contactName?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
        )
      })
    : all

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Proveedores</h1>
          <p className="text-slate-400 text-sm mt-0.5">{suppliers.length} proveedores registrados</p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nuevo proveedor
        </Link>
      </div>
      <AdminSearchInput defaultValue={search} placeholder="Buscar por nombre, contacto o email..." />
      <SuppliersTable suppliers={suppliers} />
    </div>
  )
}
