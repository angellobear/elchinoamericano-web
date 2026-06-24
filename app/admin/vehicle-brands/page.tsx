import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getVehicleBrandsWithModels, updateVehicleBrand } from '@/lib/db/vehicle-brands'
import { revalidatePath } from 'next/cache'
import { Plus, Car, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'

async function toggleActive(id: number, current: boolean) {
  'use server'
  try {
    await updateVehicleBrand(id, { isActive: !current })
    revalidatePath('/admin/vehicle-brands')
  } catch (err) {
    console.error('toggleActive vehicle-brand', err)
    redirect('/admin/vehicle-brands?error=' + encodeURIComponent('Error al cambiar estado'))
  }
}

export default async function VehicleBrandsPage() {
  const brands = await getVehicleBrandsWithModels()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Marcas de Vehículos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/vehicle-brands/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e03030] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nueva marca
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Marca</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Origen</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Modelos</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map(b => (
              <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Car size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.origin === 'chinese'  ? 'bg-red-100 text-red-700' :
                    b.origin === 'american' ? 'bg-blue-100 text-blue-700' :
                                              'bg-gray-100 text-gray-600'
                  }`}>
                    {b.origin === 'chinese' ? 'China' : b.origin === 'american' ? 'EE.UU.' : b.origin}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                    {Array.isArray(b.models) ? b.models.length : 0}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <form action={toggleActive.bind(null, b.id, b.isActive ?? true)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                        title={b.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {b.isActive
                          ? <ToggleRight size={14} className="text-emerald-500" />
                          : <ToggleLeft size={14} />
                        }
                      </button>
                    </form>
                    <Link
                      href={`/admin/vehicle-brands/${b.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#0d1f3c] hover:text-white text-gray-500 text-xs font-medium transition-colors"
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
                <td colSpan={5} className="py-16 text-center">
                  <Car size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">No hay marcas registradas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
