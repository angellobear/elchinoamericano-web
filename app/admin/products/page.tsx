import Link from 'next/link'
import { getProductList, deleteProduct } from '@/lib/db/products'
import { revalidatePath } from 'next/cache'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'
import { ProductStatusToggle } from '@/modules/admin/products/components/ProductStatusToggle'

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
          <h1 className="text-xl font-bold text-navy">Productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">{products.length} productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>

      <form className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por título, código, SKU..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Producto</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Categoría</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Tipo</th>
              <th className="text-right px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Precio</th>
              <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Stock</th>
              <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{p.code}</td>
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-800">{p.title}</div>
                  {p.partBrand?.name && (
                    <div className="text-xs text-slate-400 mt-0.5">{p.partBrand.name}</div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-sm">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                    p.type === 'original' ? 'bg-navy/10 text-navy' :
                    p.type === 'oem'      ? 'bg-blue-50 text-blue-700' :
                                            'bg-red-50 text-brand'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                  ${Number(p.price).toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`font-semibold text-sm ${
                    p.stock === 0 ? 'text-brand' :
                    p.stock <= 5  ? 'text-amber-500' :
                                    'text-emerald-600'
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                    p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <ProductStatusToggle id={p.id} isActive={p.isActive ?? true} />
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <form action={handleDelete.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand transition-colors cursor-pointer"
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
                <td colSpan={8} className="py-20 text-center">
                  <Package size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-400 text-sm">No hay productos que coincidan</p>
                  <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 mt-3 text-xs text-brand font-medium hover:underline">
                    <Plus size={12} />
                    Crear el primero
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
