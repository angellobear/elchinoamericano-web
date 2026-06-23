import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createCategory } from '@/lib/db/categories'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function create(formData: FormData) {
  'use server'
  const key  = String(formData.get('key')).trim()
  const name = String(formData.get('name')).trim()
  const description = formData.get('description') ? String(formData.get('description')) : undefined
  await createCategory({ key, name, description })
  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export default function NewCategoryPage() {
  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Nueva categoría</h1>
        <p className="text-gray-500 text-sm mt-0.5">Agrega una nueva categoría de repuestos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={create} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Clave <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="key"
              required
              placeholder="ej: motor, frenos, suspension"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Identificador único, sin espacios ni caracteres especiales</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="ej: Motor, Frenos, Suspensión"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Descripción opcional de la categoría..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium"
            >
              Crear categoría
            </button>
            <Link
              href="/admin/categories"
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
