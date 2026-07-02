import Link from 'next/link'
import { Plus } from 'lucide-react'
import { VehicleBrandsTable } from '@/modules/admin/vehicle-brands/components/VehicleBrandsTable'
import { vehicleBrandRepository } from '@/modules/admin/vehicle-brands/server/repository'
import { AdminSearchInput } from '@/app/admin/_components/AdminSearchInput'

export default async function VehicleBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const all = await vehicleBrandRepository.listForAdmin()
  const brands = search
    ? all.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : all

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Marcas de Vehículos</h1>
          <p className="text-slate-400 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/vehicle-brands/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nueva marca
        </Link>
      </div>
      <AdminSearchInput defaultValue={search} placeholder="Buscar por nombre..." />
      <VehicleBrandsTable brands={brands} />
    </div>
  )
}
