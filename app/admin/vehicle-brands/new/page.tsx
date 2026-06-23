import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createVehicleBrand } from '@/lib/db/vehicle-brands'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function create(formData: FormData) {
  'use server'
  const name   = String(formData.get('name')).trim()
  const origin = String(formData.get('origin'))
  await createVehicleBrand({ name, origin })
  revalidatePath('/admin/vehicle-brands')
  redirect('/admin/vehicle-brands')
}

export default function NewVehicleBrandPage() {
  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <Link href="/admin/vehicle-brands" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a marcas de vehículos
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Nueva marca de vehículo</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra una nueva marca de automóvil</p>
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
              placeholder="ej: Chery, Ford, BYD"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Origen <span className="text-[#e03030]">*</span>
            </label>
            <select
              name="origin"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent bg-white"
            >
              <option value="">Seleccionar origen...</option>
              <option value="chinese">China</option>
              <option value="american">EE.UU.</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium"
            >
              Crear marca
            </button>
            <Link
              href="/admin/vehicle-brands"
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
