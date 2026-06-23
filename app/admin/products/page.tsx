import Link from 'next/link'
import { getProductList } from '@/lib/db/products'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const products = await getProductList(search)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Productos</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-[#e03030] text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
          + Nuevo producto
        </Link>
      </div>

      {/* Search */}
      <form className="mb-4 flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar por título, código, SKU..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
        />
        <button type="submit" className="px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{p.title}</div>
                  <div className="text-xs text-gray-400">{p.partBrand?.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.type === 'original' ? 'bg-[#0d1f3c] text-white' :
                    p.type === 'oem'      ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={p.stock === 0 ? 'text-[#e03030] font-medium' : p.stock <= 5 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-[#0d1f3c] hover:text-[#e03030] text-xs font-medium transition-colors">
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-12">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
