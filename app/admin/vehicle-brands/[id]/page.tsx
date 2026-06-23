import { notFound } from 'next/navigation'
import { getVehicleBrandWithModels } from '@/lib/db/vehicle-brands'
import VehicleBrandEditor from './VehicleBrandEditor'

export default async function VehicleBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getVehicleBrandWithModels(Number(id))
  if (!brand) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/vehicle-brands" className="text-sm text-gray-500 hover:text-[#0d1f3c]">← Marcas de vehículos</a>
        <h1 className="text-2xl font-bold text-[#0d1f3c] mt-1">{brand.name}</h1>
      </div>
      <VehicleBrandEditor brand={brand as any} />
    </div>
  )
}
