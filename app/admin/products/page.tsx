import Link from 'next/link'
import { getProductList, deleteProduct } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'
import { getVehicleBrands } from '@/lib/db/vehicle-brands'
import { revalidatePath } from 'next/cache'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { ProductStatusToggle } from '@/modules/admin/products/components/ProductStatusToggle'
import { ProductFilters } from './_components/ProductFilters'
import { ProductPagination } from './_components/ProductPagination'

async function handleDelete(id: number) {
  'use server'
  await deleteProduct(id)
  revalidatePath('/admin/products')
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; categoryId?: string; vehicleBrandId?: string; status?: string; page?: string; limit?: string }>
}) {
  const params = await searchParams
  const { search, type } = params
  const status = params.status ?? 'active'
  const isActive = status === 'all' ? 'all' : status === 'inactive' ? false : true
  const page = Math.max(1, Number(params.page ?? 1))
  const limit = [10, 20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 10

  const categoryIds = params.categoryId
    ? params.categoryId.split(',').map(Number).filter(Boolean)
    : undefined
  const vehicleBrandIds = params.vehicleBrandId
    ? params.vehicleBrandId.split(',').map(Number).filter(Boolean)
    : undefined

  const [{ items: products, total }, categories, vehicleBrands] = await Promise.all([
    getProductList({
      search,
      type,
      categoryId: categoryIds,
      vehicleBrandId: vehicleBrandIds,
      isActive,
      page,
      limit,
    }),
    getCategories(),
    getVehicleBrands(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const baseParams: Record<string, string> = {}
  if (search) baseParams.search = search
  if (type) baseParams.type = type
  if (params.categoryId) baseParams.categoryId = params.categoryId
  if (params.vehicleBrandId) baseParams.vehicleBrandId = params.vehicleBrandId
  if (status !== 'active') baseParams.status = status

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Productos</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} productos</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>

      <ProductFilters
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        vehicleBrands={vehicleBrands.map((b) => ({ id: b.id, name: b.name }))}
        defaults={{
          search,
          type,
          categoryIds: categoryIds?.map(String),
          vehicleBrandIds: vehicleBrandIds?.map(String),
          status,
          limit: String(limit),
        }}
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Producto</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">SKU / Repuesto</th>
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
                <td className="px-4 py-3.5">
                  {p.sku && <div className="font-mono text-xs text-slate-500 uppercase">{p.sku}</div>}
                  {p.replacementCode && <div className="font-mono text-xs text-slate-400 uppercase">{p.replacementCode}</div>}
                  {!p.sku && !p.replacementCode && <span className="text-slate-300">—</span>}
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
                <td colSpan={9} className="py-20 text-center">
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
        <ProductPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          baseParams={baseParams}
        />
      </div>
    </div>
  )
}
