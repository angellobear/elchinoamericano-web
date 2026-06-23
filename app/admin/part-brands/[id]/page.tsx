import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPartBrands, updatePartBrand } from '@/lib/db/part-brands'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function save(id: number, formData: FormData) {
  'use server'
  const name          = String(formData.get('name')).trim()
  const originCountry = formData.get('originCountry') ? String(formData.get('originCountry')) : undefined
  const isActive      = formData.get('isActive') === 'on'
  await updatePartBrand(id, { name, originCountry, isActive })
  revalidatePath('/admin/part-brands')
  redirect('/admin/part-brands')
}

export default async function EditPartBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getPartBrands(true)
  const brand = all.find(b => b.id === Number(id))
  if (!brand) notFound()

  const saveWithId = save.bind(null, brand.id)

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <Link href="/admin/part-brands" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a marcas de repuestos
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Editar marca</h1>
        <p className="text-gray-500 text-sm mt-0.5">{brand.name}</p>
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
              defaultValue={brand.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">País de origen</label>
            <input
              name="originCountry"
              defaultValue={brand.originCountry ?? ''}
              placeholder="ej: Alemania, Japón, China"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={brand.isActive ?? true}
              className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Marca activa</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium"
            >
              Guardar cambios
            </button>
            <Link
              href="/admin/part-brands"
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
