import Link from 'next/link'
import { Pencil, Wrench } from 'lucide-react'
import type { PartBrandListItem } from '@/modules/admin/part-brands/types'
import { PartBrandStatusToggle } from '@/modules/admin/part-brands/components/PartBrandStatusToggle'

interface PartBrandsTableProps {
  brands: PartBrandListItem[]
}

export function PartBrandsTable({ brands }: PartBrandsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Marca</th>
            <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">País de origen</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3.5 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Wrench size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{brand.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-slate-500">{brand.originCountry ?? '—'}</td>
              <td className="px-4 py-3.5 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${brand.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-slate-500'
                  }`}>
                  {brand.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/part-brands/${brand.id}`}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </Link>
                  <PartBrandStatusToggle id={brand.id} isActive={brand.isActive ?? true} />
                </div>
              </td>
            </tr>
          ))}
          {brands.length === 0 && (
            <tr>
              <td colSpan={4} className="py-16 text-center">
                <Wrench size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400">No hay marcas registradas</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
