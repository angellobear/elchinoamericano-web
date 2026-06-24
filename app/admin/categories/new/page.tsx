import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createCategory } from '@/lib/db/categories'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseCategoryFormData } from '@/modules/admin/categories/form-schema'
import { CategoryForm } from '@/modules/admin/categories/components/CategoryForm'

async function create(formData: FormData) {
  'use server'
  try {
    const parsed = parseCategoryFormData(formData, { isActive: true })
    if (!parsed.success) {
      redirect(`${routes.admin.categories.create}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { key, name, description, sortOrder } = parsed.data
    const file        = formData.get('image') as File | null
    const removed     = formData.get('image_removed') === '1'

    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null, removed, null, null
    )

    await createCategory({ key, name, description, sortOrder, imageUrl: imageUrl ?? undefined, imagePublicId: imagePublicId ?? undefined })
    logger.info({ key, name }, 'Category created')
    revalidatePath(routes.admin.categories.index)
  } catch (err) {
    logger.error({ err }, 'Error creating category')
    redirect(`${routes.admin.categories.index}?error=` + encodeURIComponent('Error al crear categoría'))
  }
  redirect(`${routes.admin.categories.index}?success=` + encodeURIComponent('Categoría creada'))
}

export default function NewCategoryPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.categories.index}
        backLabel="Volver a categorías"
        title="Nueva categoría"
        description="Agrega una nueva categoría de repuestos"
      />
      <FormCard>
        <CategoryForm action={create} mode="create" />
      </FormCard>
    </div>
  )
}
