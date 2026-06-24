import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPartBrands, updatePartBrand } from '@/lib/db/part-brands'
import { revalidatePath } from 'next/cache'
import { Plus, Pencil, ToggleLeft, ToggleRight, Wrench } from 'lucide-react'

async function toggleActive(id: number, current: boolean) {
  'use server'
  try {
    await updatePartBrand(id, { isActive: !current })
    revalidatePath('/admin/part-brands')
  } catch (err) {
    console.error('toggleActive part-brand', err)
    redirect('/admin/part-brands?error=' + encodeURIComponent('Error al cambiar estado'))
  }
}

export default async function PartBrandsPage() {
  const brands = await getPartBrands(true)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Marcas de Repuestos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marcas registradas</p>
        </div>
        <Link
          href="/admin/part-brands/new"
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
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">País de origen</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map(b => (
              <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Wrench size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500">{b.originCountry ?? '—'}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/part-brands/${b.id}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0d1f3c] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <form action={toggleActive.bind(null, b.id, b.isActive ?? true)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                        title={b.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {b.isActive
                          ? <ToggleRight size={13} className="text-emerald-500" />
                          : <ToggleLeft size={13} />
                        }
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Wrench size={32} className="mx-auto mb-3 text-gray-300" />
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
