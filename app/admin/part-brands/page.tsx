import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PartBrandsTable } from '@/modules/admin/part-brands/components/PartBrandsTable'
import { partBrandRepository } from '@/modules/admin/part-brands/server/repository'
import { AdminSearchInput } from '@/app/admin/_components/AdminSearchInput'

export default async function PartBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const all = await partBrandRepository.listForAdmin()
  const brands = search
    ? all.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : all

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Marcas de Repuestos</h1>
          <p className="text-slate-400 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/part-brands/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nueva marca
        </Link>
      </div>
      <AdminSearchInput defaultValue={search} placeholder="Buscar por nombre..." />
      <PartBrandsTable brands={brands} />
    </div>
  )
}
