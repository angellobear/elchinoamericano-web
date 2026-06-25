import Link from 'next/link'
import { getCategories } from '@/lib/db/categories'
import { Plus, Pencil, Tag } from 'lucide-react'
import { CategoryStatusToggle } from '@/modules/admin/categories/components/CategoryStatusToggle'
import { CategoryDeleteButton } from '@/modules/admin/categories/components/CategoryDeleteButton'

export default async function CategoriesPage() {
  const categories = await getCategories(true)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Categorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categorías registradas</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nueva categoría
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Clave</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Orden</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {c.parentId && <span className="text-gray-300">└</span>}
                    <Tag size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{c.key}</td>
                <td className="px-4 py-3.5 text-center text-gray-500">{c.sortOrder}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <CategoryStatusToggle id={c.id} isActive={c.isActive ?? true} />
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <CategoryDeleteButton id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Tag size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">No hay categorías registradas</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
