import Link from 'next/link'
import { Car, ChevronRight } from 'lucide-react'
import type { VehicleBrandListItem } from '@/modules/admin/vehicle-brands/types'
import { VehicleBrandStatusToggle } from '@/modules/admin/vehicle-brands/components/VehicleBrandStatusToggle'

interface VehicleBrandsTableProps {
  brands: VehicleBrandListItem[]
}

export function VehicleBrandsTable({ brands }: VehicleBrandsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Marca</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Origen</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Modelos</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Web</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3.5 w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Car size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{brand.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${brand.origin === 'chinese'
                  ? 'bg-red-50 text-red-700'
                  : brand.origin === 'american'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                  {brand.origin === 'chinese' ? 'China' : brand.origin === 'american' ? 'EE.UU.' : brand.origin}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  {brand.models.length}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                  brand.isVisibleOnWeb ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {brand.isVisibleOnWeb ? 'Visible' : 'Oculta'}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${brand.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {brand.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <VehicleBrandStatusToggle id={brand.id} isActive={brand.isActive ?? true} />
                  <Link
                    href={`/admin/vehicle-brands/${brand.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-navy hover:text-white text-slate-500 text-xs font-medium transition-colors"
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
              <td colSpan={6} className="py-20 text-center">
                <Car size={28} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">No hay marcas registradas</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
