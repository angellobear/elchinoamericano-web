import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCategories, updateCategory } from '@/lib/db/categories'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'

async function save(id: number, formData: FormData) {
  'use server'
  try {
    const name           = String(formData.get('name')).trim()
    const description    = (formData.get('description') as string)?.trim() || undefined
    const sortOrder      = Number(formData.get('sortOrder')) || 0
    const isActive       = formData.get('isActive') === 'on'
    const file           = formData.get('image') as File | null
    const currentUrl     = formData.get('image_current_url') as string
    const currentPublicId = formData.get('image_public_id') as string
    const removed        = formData.get('image_removed') === '1'

    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
    )

    await updateCategory(id, { name, description, sortOrder, isActive, imageUrl: imageUrl ?? undefined, imagePublicId: imagePublicId ?? undefined })
    logger.info({ id, name }, 'Category updated')
    revalidatePath('/admin/categories')
  } catch (err) {
    logger.error({ err }, 'Error updating category')
    redirect('/admin/categories?error=' + encodeURIComponent('Error al guardar categoría'))
  }
  redirect('/admin/categories?success=' + encodeURIComponent('Categoría guardada'))
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getCategories(true)
  const cat = all.find(c => c.id === Number(id))
  if (!cat) notFound()

  const saveWithId = save.bind(null, cat.id)

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a categorías
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Editar categoría</h1>
        <p className="text-gray-500 text-sm mt-0.5 font-mono">{cat.key}</p>
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
              defaultValue={cat.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={cat.description ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden de visualización</label>
            <input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={cat.sortOrder ?? 0}
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <ImageUploadField
            name="image"
            label="Imagen de categoría"
            currentUrl={cat.imageUrl}
            currentPublicId={(cat as { imagePublicId?: string | null }).imagePublicId}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={cat.isActive ?? true}
              className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Categoría activa</label>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Guardar cambios
            </SubmitButton>
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
