import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPartBrands, updatePartBrand } from '@/lib/db/part-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { PartBrandForm } from '@/modules/admin/part-brands/components/PartBrandForm'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { parsePartBrandFormData } from '@/modules/admin/part-brands/form-schema'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parsePartBrandFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, originCountry, isActive } = parsed.data
    const file = formData.get('logo') as File | null
    const currentUrl = formData.get('logo_current_url') as string
    const currentPublicId = formData.get('logo_public_id') as string
    const removed = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
    )

    await updatePartBrand(id, {
      name,
      originCountry,
      isActive,
      logoUrl: logoUrl ?? undefined,
      logoPublicId: logoPublicId ?? undefined,
    })
    logger.info({ id, name }, 'Part brand updated')
    revalidatePath(routes.admin.partBrands.index)
  } catch (err) {
    logger.error({ err }, 'Error updating part brand')
    return errorResult('Error al guardar marca')
  }

  return successResult('Marca guardada', undefined, { redirectTo: routes.admin.partBrands.index })
}

export default async function EditPartBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const all = await getPartBrands(true)
  const brand = all.find((b) => b.id === Number(id))
  if (!brand) notFound()

  const saveWithId = save.bind(null, brand.id)

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.partBrands.index}
        backLabel="Volver a marcas de repuestos"
        title="Editar marca"
        description={brand.name}
      />

      <FormCard>
        <PartBrandForm
          action={saveWithId}
          mode="edit"
          defaults={{
            name: brand.name,
            originCountry: brand.originCountry ?? undefined,
            isActive: brand.isActive ?? true,
            logoUrl: brand.logoUrl,
            logoPublicId: (brand as { logoPublicId?: string | null }).logoPublicId,
          }}
        />
      </FormCard>
    </div>
  )
}
