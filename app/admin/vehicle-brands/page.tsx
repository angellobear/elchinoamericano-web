import Link from 'next/link'
import { getVehicleBrandsWithModels } from '@/lib/db/vehicle-brands'

export default async function VehicleBrandsPage() {
  const brands = await getVehicleBrandsWithModels()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Marcas de Vehículos</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Marca</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Origen</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Modelos</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.origin === 'chinese' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {b.origin === 'chinese' ? 'China' : b.origin === 'american' ? 'EE.UU.' : b.origin}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {Array.isArray(b.models) ? b.models.length : 0}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/vehicle-brands/${b.id}`} className="text-[#0d1f3c] hover:text-[#e03030] text-xs font-medium transition-colors">
                    Gestionar modelos →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
