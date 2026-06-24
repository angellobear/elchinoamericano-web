import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSuppliers, deleteSupplier } from '@/lib/db/suppliers'
import { revalidatePath } from 'next/cache'
import { Plus, Pencil, Trash2, Truck, ToggleLeft, ToggleRight } from 'lucide-react'
import { updateSupplier } from '@/lib/db/suppliers'

async function handleDelete(id: number) {
  'use server'
  try {
    await deleteSupplier(id)
    revalidatePath('/admin/suppliers')
  } catch (err) {
    console.error('handleDelete supplier', err)
    redirect('/admin/suppliers?error=' + encodeURIComponent('Error al eliminar proveedor'))
  }
}

async function toggleActive(id: number, current: boolean) {
  'use server'
  try {
    await updateSupplier(id, { isActive: !current })
    revalidatePath('/admin/suppliers')
  } catch (err) {
    console.error('toggleActive supplier', err)
    redirect('/admin/suppliers?error=' + encodeURIComponent('Error al cambiar estado'))
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers(true)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} proveedores registrados</p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e03030] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo proveedor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Proveedor</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Contacto</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Teléfono</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Truck size={13} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500">{s.contactName ?? '—'}</td>
                <td className="px-4 py-3.5 text-gray-500">{s.email ?? '—'}</td>
                <td className="px-4 py-3.5 text-gray-500">{s.phone ?? '—'}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                    s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/suppliers/${s.id}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0d1f3c] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </Link>
                    <form action={toggleActive.bind(null, s.id, s.isActive ?? true)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
                        title={s.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {s.isActive
                          ? <ToggleRight size={13} className="text-emerald-500" />
                          : <ToggleLeft size={13} />}
                      </button>
                    </form>
                    <form action={handleDelete.bind(null, s.id)}>
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
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Truck size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400">No hay proveedores registrados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
