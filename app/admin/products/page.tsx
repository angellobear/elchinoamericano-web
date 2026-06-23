import Link from 'next/link'
import { getProductList, deleteProduct } from '@/lib/db/products'
import { revalidatePath } from 'next/cache'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'

async function handleDelete(id: number) {
  'use server'
  await deleteProduct(id)
  revalidatePath('/admin/products')
}

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
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} productos encontrados</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e03030] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>

      <form className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por título, código, SKU..."
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Código</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Producto</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Categoría</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-right px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Precio</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Stock</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{p.code}</td>
                <td className="px-4 py-3.5">
                  <div className="font-medium text-gray-800">{p.title}</div>
                  {p.partBrand?.name && (
                    <div className="text-xs text-gray-400 mt-0.5">{p.partBrand.name}</div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.type === 'original' ? 'bg-[#0d1f3c] text-white' :
                    p.type === 'oem'      ? 'bg-blue-100 text-blue-700' :
                                            'bg-red-100 text-red-700'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-gray-800">
                  ${Number(p.price).toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`font-semibold ${
                    p.stock === 0 ? 'text-[#e03030]' :
                    p.stock <= 5  ? 'text-amber-600' :
                                    'text-emerald-600'
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0d1f3c] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <form action={handleDelete.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#e03030] transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Package size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">No hay productos que coincidan</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
