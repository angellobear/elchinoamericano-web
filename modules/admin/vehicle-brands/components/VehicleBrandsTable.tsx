import Link from 'next/link'
import { Car, ChevronRight } from 'lucide-react'
import type { VehicleBrandListItem } from '@/modules/admin/vehicle-brands/types'
import { VehicleBrandStatusToggle } from '@/modules/admin/vehicle-brands/components/VehicleBrandStatusToggle'

interface VehicleBrandsTableProps {
  brands: VehicleBrandListItem[]
}

export function VehicleBrandsTable({ brands }: VehicleBrandsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Marca</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Origen</th>
            <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Modelos</th>
            <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Web</th>
            <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
            <th className="px-4 py-3.5 w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Car size={13} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800">{brand.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${brand.origin === 'chinese'
                  ? 'bg-red-100 text-red-700'
                  : brand.origin === 'american'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {brand.origin === 'chinese' ? 'China' : brand.origin === 'american' ? 'EE.UU.' : brand.origin}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                  {brand.models.length}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                  brand.isVisibleOnWeb ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {brand.isVisibleOnWeb ? 'Visible' : 'Oculta'}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${brand.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {brand.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <VehicleBrandStatusToggle id={brand.id} isActive={brand.isActive ?? true} />
                  <Link
                    href={`/admin/vehicle-brands/${brand.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-navy hover:text-white text-gray-500 text-xs font-medium transition-colors"
                  >
                    Gestionar
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
          {brands.length === 0 && (
            <tr>
              <td colSpan={6} className="py-16 text-center">
                <Car size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400">No hay marcas registradas</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
