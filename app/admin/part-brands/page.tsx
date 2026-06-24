import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PartBrandsTable } from '@/modules/admin/part-brands/components/PartBrandsTable'
import { partBrandRepository } from '@/modules/admin/part-brands/server/repository'

export default async function PartBrandsPage() {
  const brands = await partBrandRepository.listForAdmin()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Marcas de Repuestos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/part-brands/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nueva marca
        </Link>
      </div>
      <PartBrandsTable brands={brands} />
    </div>
  )
}
