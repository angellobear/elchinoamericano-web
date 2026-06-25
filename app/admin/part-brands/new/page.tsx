import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createPartBrand } from '@/lib/db/part-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parsePartBrandFormData } from '@/modules/admin/part-brands/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { PartBrandForm } from '@/modules/admin/part-brands/components/PartBrandForm'

async function create(_: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parsePartBrandFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, originCountry } = parsed.data
    const file          = formData.get('logo') as File | null
    const removed       = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null, removed, null, null
    )

    await createPartBrand({ name, originCountry, logoUrl: logoUrl ?? undefined, logoPublicId: logoPublicId ?? undefined })
    logger.info({ name }, 'Part brand created')
    revalidatePath(routes.admin.partBrands.index)
  } catch (err) {
    logger.error({ err }, 'Error creating part brand')
    return errorResult('Error al crear marca')
  }

  return successResult('Marca creada', undefined, { redirectTo: routes.admin.partBrands.index })
}

export default function NewPartBrandPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.partBrands.index}
        backLabel="Volver a marcas de repuestos"
        title="Nueva marca de repuesto"
        description="Registra un fabricante de repuestos"
      />

      <FormCard>
        <PartBrandForm action={create} mode="create" />
      </FormCard>
    </div>
  )
}
