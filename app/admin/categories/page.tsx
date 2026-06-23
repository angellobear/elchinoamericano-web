import { getCategories } from '@/lib/db/categories'

export default async function CategoriesPage() {
  const categories = await getCategories(true)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-6">Categorías</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Clave</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Orden</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {c.parentId && <span className="text-gray-400 mr-2">└</span>}
                  {c.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.key}</td>
                <td className="px-4 py-3 text-center text-gray-500">{c.sortOrder}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
