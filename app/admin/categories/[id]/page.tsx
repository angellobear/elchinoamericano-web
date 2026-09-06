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
import { getJwtPayload } from '@/lib/auth/check-permission'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { CATEGORY_PERMISSION_KEYS } from '@/modules/admin/categories/types'
import { parseCategoryFormData } from '@/modules/admin/categories/form-schema'
import { CategoryForm } from '@/modules/admin/categories/components/CategoryForm'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'

  const payload = await getJwtPayload()
  if (!hasModulePermission(payload, CATEGORY_PERMISSION_KEYS, 'can_edit')) {
    return errorResult('No tienes permiso para realizar esta acción.')
  }

  try {
    const parsed = parseCategoryFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const current = (await getCategories(true)).find((c) => c.id === id)
    if (!current) {
      return errorResult('No se encontró la categoría a editar.')
    }

    const { name, description, sortOrder, isActive } = parsed.data
    const file    = formData.get('image') as File | null
    const removed = formData.get('image_removed') === '1'

    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      current.imagePublicId ?? null,
      current.imageUrl ?? null,
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
    <div className="p-4 md:p-8">
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
