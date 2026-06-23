import { getPartBrands } from '@/lib/db/part-brands'

export default async function PartBrandsPage() {
  const brands = await getPartBrands(true)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-6">Marcas de Repuestos</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Marca</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">País de origen</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.originCountry ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isActive ? 'Activa' : 'Inactiva'}
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
