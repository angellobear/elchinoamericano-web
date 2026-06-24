import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'

async function create(formData: FormData) {
  'use server'
  try {
    const name        = String(formData.get('name')).trim()
    const contactName = (formData.get('contactName') as string)?.trim() || undefined
    const email       = (formData.get('email') as string)?.trim() || undefined
    const phone       = (formData.get('phone') as string)?.trim() || undefined
    const address     = (formData.get('address') as string)?.trim() || undefined

    await createSupplier({ name, contactName, email, phone, address })
    logger.info({ name }, 'Supplier created')
    revalidatePath('/admin/suppliers')
  } catch (err) {
    logger.error({ err }, 'Error creating supplier')
    redirect('/admin/suppliers?error=' + encodeURIComponent('Error al crear proveedor'))
  }
  redirect('/admin/suppliers?success=' + encodeURIComponent('Proveedor creado'))
}

export default function NewSupplierPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a proveedores
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Nuevo proveedor</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra un proveedor de repuestos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={create} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="ej: Importadora Rueda S.A."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de contacto</label>
            <input
              name="contactName"
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
                placeholder="contacto@empresa.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input
                name="phone"
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
              placeholder="Dirección del proveedor..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Crear proveedor
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
