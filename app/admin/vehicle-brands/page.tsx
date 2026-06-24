import Link from 'next/link'
import { Plus } from 'lucide-react'
import { VehicleBrandsTable } from '@/modules/admin/vehicle-brands/components/VehicleBrandsTable'
import { vehicleBrandRepository } from '@/modules/admin/vehicle-brands/server/repository'

export default async function VehicleBrandsPage() {
  const brands = await vehicleBrandRepository.listForAdmin()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Marcas de Vehículos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/vehicle-brands/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nueva marca
        </Link>
      </div>
      <VehicleBrandsTable brands={brands} />
    </div>
  )
}
