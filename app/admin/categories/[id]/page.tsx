import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCategories, updateCategory } from '@/lib/db/categories'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { parseCategoryFormData } from '@/modules/admin/categories/form-schema'
import { CategoryForm } from '@/modules/admin/categories/components/CategoryForm'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseCategoryFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, description, sortOrder, isActive } = parsed.data
    const file           = formData.get('image') as File | null
    const currentUrl     = formData.get('image_current_url') as string
    const currentPublicId = formData.get('image_public_id') as string
    const removed        = formData.get('image_removed') === '1'

    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
      'categories',
    )

    await updateCategory(id, { name, description, sortOrder, isActive, imageUrl: imageUrl ?? undefined, imagePublicId: imagePublicId ?? undefined })
    logger.info({ id, name }, 'Category updated')
    revalidatePath(routes.admin.categories.index)
  } catch (err) {
    logger.error({ err }, 'Error updating category')
    return errorResult('Error al guardar categoría')
  }

  return successResult('Categoría guardada', undefined, { redirectTo: routes.admin.categories.index })
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getCategories(true)
  const cat = all.find(c => c.id === Number(id))
  if (!cat) notFound()

  const saveWithId = save.bind(null, cat.id)

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.categories.index}
        backLabel="Volver a categorías"
        title="Editar categoría"
        description={cat.key}
      />
      <FormCard>
        <CategoryForm
          action={saveWithId}
          mode="edit"
          defaults={{
            key: cat.key,
            name: cat.name,
            description: cat.description ?? undefined,
            sortOrder: cat.sortOrder ?? 0,
            isActive: cat.isActive ?? true,
            imageUrl: cat.imageUrl,
            imagePublicId: (cat as { imagePublicId?: string | null }).imagePublicId,
          }}
        />
      </FormCard>
    </div>
  )
}
