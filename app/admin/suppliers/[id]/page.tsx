import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSuppliers, updateSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'

async function save(id: number, formData: FormData) {
  'use server'
  try {
    const name        = String(formData.get('name')).trim()
    const contactName = (formData.get('contactName') as string)?.trim() || undefined
    const email       = (formData.get('email') as string)?.trim() || undefined
    const phone       = (formData.get('phone') as string)?.trim() || undefined
    const address     = (formData.get('address') as string)?.trim() || undefined
    const isActive    = formData.get('isActive') === 'on'

    await updateSupplier(id, { name, contactName, email, phone, address, isActive })
    logger.info({ id, name }, 'Supplier updated')
    revalidatePath('/admin/suppliers')
  } catch (err) {
    logger.error({ err }, 'Error updating supplier')
    redirect('/admin/suppliers?error=' + encodeURIComponent('Error al guardar proveedor'))
  }
  redirect('/admin/suppliers?success=' + encodeURIComponent('Proveedor guardado'))
}

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getSuppliers(true)
  const supplier = all.find(s => s.id === Number(id))
  if (!supplier) notFound()

  const saveWithId = save.bind(null, supplier.id)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a proveedores
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Editar proveedor</h1>
        <p className="text-gray-500 text-sm mt-0.5">{supplier.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={saveWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="name"
              required
              defaultValue={supplier.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de contacto</label>
            <input
              name="contactName"
              defaultValue={supplier.contactName ?? ''}
              placeholder="ej: Carlos Rueda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={supplier.email ?? ''}
                placeholder="contacto@empresa.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input
                name="phone"
                defaultValue={supplier.phone ?? ''}
                placeholder="+593 99 999 9999"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
            <textarea
              name="address"
              rows={2}
              defaultValue={supplier.address ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={supplier.isActive ?? true}
              className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Proveedor activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Guardar cambios
            </SubmitButton>
            <Link
              href="/admin/suppliers"
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
